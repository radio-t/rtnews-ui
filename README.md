# rtnews-ui - Клиентская сторона для новой версии news.radio-t.com

Полное описание задачи можно [подсмотреть здесь](http://p.umputun.com/2015/11/26/vsiem-mirom-dlia-obshchiei-polzy/)

----
### Разработка
Таски описаны в `makefile`

#### Build
```
# modes are: production|development
npm install && ./node_modules/.bin/webpack --mode "development"
```

После билда, все нужные файлы будут в папке `public`. Для работы нужен реврайт несуществующих урлов на index.html.

#### Dev Server
```
./node_modules/.bin/webpack-dev-server --mode "development"
```

#### С помощью Docker
В makefile продублированы команды для docker

#### ENVIRONMENT
**RTHOST**: Ссылка на api. По умолчанию используется `https://news.radio-t.com/api/v1` для продакшна и `http://jess.umputun.com:8780/api/v1` для дева

----
### Feeds API

* `GET /api/v1/feeds` - list of feeds
* `POST /api/v1/feeds` - add feed, needs at least {feedlink: url}
* `DELETE /api/v1/feeds/:id` - delete feed by id

## _feed record_
```
    {
        "active": true,
        "feedlink": "http://www.instapaper.com/folder/1733843/rss/470308/Epogj3Ubs5DdJJnUdVD2HUAKSk",
        "id": "566283bd4e1ad997adf3f532",
        "updated": "2015-12-05T06:27:09.449Z"
    }
```
----
### News API

* basic news ops
 * `POST /api/v1/news` - add article
 * `GET /api/v1/news` - get all news, except deleted. Strps "content" field
 * `GET /api/v1/news/id/:id` - get full article by id, including "content"
 * `GET /api/v1/news/last/:count` - get last articles
 * `GET /api/v1/news/slug/:slug` - get article by slug
 * `GET /api/v1/news/domain/#domain` - get articles for domain
 * `DELETE /api/v1/news/:id` - delete by id (mark as deleted)

* delete/archive ops
 * `PUT /api/v1/news/undelete/:id` - undelete by id (clear deleted status)
 * `GET /api/v1/news/del` - get deleted articles
 * `PUT /api/v1/news/archive/:id` - archive article by id
 * `GET /api/v1/news/archive` - get list of archives articles

* move
 * `PUT /api/v1/news/move/:pos/:offset` - move from pos with +/- offset
 * `PUT /api/v1/news/moveid/:id/:offset` - move from id with +/- offset
 * `GET /api/v1/news/positions` - get positions as {id:pos, id1:pos1 ...}

* activation
 * `PUT /api/v1/news/active/:id` - activate article by id
 * `GET /api/v1/news/active` - get active article
 * `GET /api/v1/news/active/href` - get active article as {title:foo, url:bar}
 * `GET /api/v1/news/active/id` - get id of active article as {id:xyz}
 * `GET /api/v1/news/active/last/:hrs` - get articles activated in last hrs
 * `DELETE /api/v1/news/active/last/:hrs` - archive all article activate in last :hrs
 * `GET /api/v1/news/lastmd/:hrs`, - get markdown of recently activated`
 * `GET /api/v1/news/active/wait/:secs` - wait for change of active up to :secs

* marking
 * `PUT /api/v1/news/nogeek/:id` - mark as geek-article by id
 * `PUT /api/v1/news/geek/:id` - mark as regular (non-geek) by id

* miscs
 * `GET /api/v1/news/rss/:count` - get rss feed with last (by time) :count
 * `PUT /api/v1/news/reload` - force reprocessing of all RSS feeds
 * `PUT /api/v1/show/start` - save start time (used by markdown request)
 * `GET /api/v1/show/start` - return saved start time

## _article (news) records_

```
{
    "active": false,
    "activets": "0001-01-01T00:00:00Z",
    "archived": false,
    "ats": "2015-12-05T06:29:05.414Z",
    "author": "",
    "comments": 0,
    "content": "At GitHub we place an emphasis on stability, ....... CAN BE REALLY BIG ..."
    "del": false,
    "domain": "",
    "exttitle": "",
    "feed": "http://www.instapaper.com/rss/94339/obmip3D4ed6h67x3zX1oNbNWCYw",
    "geek": true,
    "id": "566284314e1ad997adf3f56a",
    "likes": 0,
    "link": "http://githubengineering.com/githubs-metal-cloud/",
    "origlink": "http://githubengineering.com/githubs-metal-cloud/",
    "pic": "http://githubengineering.com/images/githubs-metal-cloud/gpanel-chassis-view.png",
    "position": 0,
    "slug": "github-s-metal-cloud-github-engineering",
    "snippet": "At GitHub we place an emphasis on stability, availability, and performance. A large component of ensuring we excel in these areas is deploying services on bare-metal hardware. This allows us to&hellip;",
    "title": "GitHub's Metal Cloud - GitHub Engineering",
    "ts": "2015-12-05T05:17:21Z",
    "votes": 0,
    "origlink": "http://githubengineering.com/githubs-metal-cloud/"
}
```

по поводу нескольких ts (тут их целых 3) могут быть резонные вопросы:

1. `activets` – момент активации новости
1. `ts` – время новости из rss
1. `ats` – когда новость добавлена в систему

Как правило, `link` и `origlink` идентичны, однако в некоторых случаях они могут отличаться. `origlink` всегда содержит исходную ссылку, а `link` - это конечная ссылка после всех возможных редиректов.

