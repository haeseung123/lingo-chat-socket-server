<div align="center">
  <h1>LingoChat Socket Server(채팅 서버)</h1>
</div>

실시간 채팅 기능을 제공하는 LingoChat의 소켓 서버로,

유저와 AI 페르소나 모델 간의 1:N 실시간 대화를 처리하고 중복 로그인 사용자 관리 및 세션 유지 기능을 제공합니다.

<br>

## 프로젝트 개요

LingoChat의 소켓 서버는 WebSocket을 활용해 유저와 페르소나 캐릭터 간의 실시간 1:N 대화를 위해 개발되었습니다.

이 서버는 클라이언트 ↔ AI 서버 간 실시간 메시지를 중계하고 JWT + Redis를 활용하여 세션 및 중복 로그인을 제어하는 것으로 사용자 경험을 해치지 않는 데 초점을 두었습니다.

<br>

## 기술 스택

-   Nest.JS, Typescript, Redis, Socket.IO

<br>

## 실행 방법

```
git clone ...
npm install

npm run docker:build
npm run docker:start
```

### 환경 변수 설정 (.development.env)

```
SERVER_PORT=
REDIS_HOST=
REDIS_PORT=
REDIS_DB=
API_SERVER_URL=
```

<br>

## 주요 기능

### 채팅 흐름 - 📎 [웹소켓으로 실시간 챗봇 구현하기](https://velog.io/@showui96/%EB%A7%81%EA%B3%A0%EC%B1%973-%EC%9B%B9%EC%86%8C%EC%BC%93%EC%9C%BC%EB%A1%9C-%EC%8B%A4%EC%8B%9C%EA%B0%84-%EC%B1%97%EB%B4%87-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0#%EC%B1%84%ED%8C%85-%EB%A1%9C%EC%A7%81)

<br>

![image](https://github.com/user-attachments/assets/6ace9a0d-b51f-47b1-acd1-3bc5e6706c1e)

### 중복 로그인 및 세션 관리 - 📎 [웹소켓과 Redis를 활용한 실시간 세션 관리](https://velog.io/@showui96/%EB%A7%81%EA%B3%A0%EC%B1%972-JWT-%EC%9D%B8%EC%A6%9D%EC%97%90%EC%84%9C%EC%9D%98-%EC%A4%91%EB%B3%B5-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EB%B0%A9%EC%A7%80%ED%95%98%EA%B8%B0#%EC%9B%B9%EC%86%8C%EC%BC%93%EA%B3%BC-redis%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EC%8B%A4%EC%8B%9C%EA%B0%84-%EC%84%B8%EC%85%98-%EA%B4%80%EB%A6%AC)

<br>

![image](https://github.com/user-attachments/assets/c8c2f20f-3a9f-4987-a2d9-e392fa2522a2)

<br>

## 프로젝트 구조 (Directory Structure)

```
src/
├── cross-websocket/         # AI, API 서버 소켓 게이트웨이
├── global/                  # 환경 변수 및 Redis 관련 서비스 정의
├── users/                   # 클라이언트 소켓 게이트웨이 및 채팅 비즈니스 로직
└── main.ts
```

<br>

## 소켓 이벤트 명세

-   실제 클라이언트가 받는 이벤트는 UsersGateway의 emit을 통해 이루어짐

### 클라이언트 → 서버(@SubscribeMessage)

| 이벤트 명                 | 설명                                          | Payload 예시                            |
| ------------------------- | --------------------------------------------- | --------------------------------------- |
| send_message              | 메시지 전송(내부적으로 API서버에 메시지 전달) | { message: string; personaId: number }  |
| chat_message(chatMessage) | 일반 채팅창에 메시지 전송                     | { chatRoomId: number; message: string } |

### 서버 → 클라이언트(emit)

| 이벤트 명              | 설명                                   | Data 예시                                                    |
| ---------------------- | -------------------------------------- | ------------------------------------------------------------ |
| ${event}_${chatRoomId} | 특정 채팅방에 메시지 전달              | { chatRoomId: number; message: string; ... }                 |
| new_chat_room          | 새로운 채팅방에 대하여 실시간 업데이트 | { chatRoomId: number; title: string; createdAt: string ... } |

### 클라이언트 ↔ API 서버 ↔ AI 서버

| 이벤트 명             | 설명                                           | Payload 예시                                            |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| created_new_chat_room | 생성된 신규 채팅방 정보 전달(API → 클라이언트) | { userId: string; chatRoomId: number; title: string; }  |
| ai_chat_message       | AI 응답 메시지 전달(AI → 클라이언트)           | { chatRoomId, message, isFinal }                        |
| api_chat_message      | 테스트용으로 사용X                             | { userId: string; chatRoomId: number; message: string } |

<br>

## 개발 및 배포 관련 정보

-   Docker 기반 컨테이너화
-   GitHub Actions를 활용한 CI 파이프라인 구성
-   ArgoCD + Argo Image Updater 를 활용한 CD 환경 자동화

<br>

## 📎 관련 레포지토리

-   프론트엔드 및 API, AI 서버 : https://github.com/lingo-chat
-   링고챗 헬름 차트 : https://github.com/haeseung123/lingo-chat-helm
