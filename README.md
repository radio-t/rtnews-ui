# rtnews-ui - Клиентская сторона для новой версии news.radio-t.com

Полное описание задачи можно [подсмотреть здесь](http://p.umputun.com/2015/11/26/vsiem-mirom-dlia-obshchiei-polzy/)

#### API 

    GET /api/v1/feeds - список фидов
    POST /api/v1/feeds - добавить фид {feedlink: url}

    GET /api/v1/news - все новости, кроме удаленных
    DELETE /api/v1/news/:id - удалить (пометить как удаленную)
    PUT /api/v1/news/move/:pos/:offset - двигать новость вверх/вниз

    PUT /api/v1/news/active/:id - пометить как активную
    GET /api/v1/news/active - взять текущую активную
    GET /api/v1/news/active/id - взять id текущей активной
    GET /api/v1/news/active/last/:hrs - список всех что были активны за последние hrs часов

    PUT /api/v1/news/nogeek/:id - пометить как обычную, негиковскую 
    PUT /api/v1/news/geek/:id - пометить как гиковскую

    PUT /api/v1/news/reload - форс-релоад из фидов (раз в 5 минут делает само)

пример:
```
http GET master.radio-t.com:8778/api/v1/news/active/id
HTTP/1.1 200 OK
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS
Access-Control-Allow-Origin: *
Application-Name: rt-news
Connection: keep-alive
Content-Length: 33
Content-Type: application/json
Date: Thu, 26 Nov 2015 22:47:17 GMT
Org: Radio-T
Server: nginx/1.9.7
X-Powered-By: go-json-rest

{
    "id": "5657741292d7e8a4ace10c5a"
}
```

и еще один:
```
http GET master.radio-t.com:8778/api/v1/news/active

HTTP/1.1 200 OK
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS
Access-Control-Allow-Origin: *
Application-Name: rt-news
Connection: keep-alive
Content-Length: 676
Content-Type: application/json
Date: Thu, 26 Nov 2015 22:49:01 GMT
Org: Radio-T
Server: nginx/1.9.7
X-Powered-By: go-json-rest

{
    "active": true,
    "activets": "2015-11-26T22:43:20.24Z",
    "ats": "2015-11-26T21:05:21.239Z",
    "content": "",
    "del": false,
    "feed": "http://www.instapaper.com/folder/1733843/rss/470308/Epogj3Ubs5DdJJnUdVD2HUAKSk",
    "geek": false,
    "id": "5657741292d7e8a4ace10c5a",
    "link": "http://techcrunch.com/2014/07/07/mit-and-dropbox-alums-launch-inbox-a-next-generation-email-platform/",
    "pic": "",
    "position": 6,
    "snippet": "Founded by Dropbox and MIT alums, a new startup called Inbox is launching out of stealth today, hoping to power the next generation of email applications.…",
    "title": "MIT And Dropbox Alums Launch Inbox, A Next-Generation Email Platform | TechCrunch",
    "ts": "2014-07-08T18:10:23Z",
    "votes": 0
}
```

по поводу нескольких ts (тут их целых 3) могут быть резонные вопросы:

1. `activets` – момент активации новости
1. `ts` – время новости из rss
1. `ats` – когда новость добавлена в систему

