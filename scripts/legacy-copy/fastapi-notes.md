这篇笔记整理两个经常在本地测试正常、到了浏览器或真实查询条件下才出现的问题。

## 异常响应也需要 CORS 头

Postman 不执行浏览器的同源策略，所以“Postman 能请求”不能证明 CORS 配置正确。浏览器报跨域时，先检查真实响应是否包含 `Access-Control-Allow-Origin`。

为了让未处理异常产生的响应也经过 CORS，可以让 `CORSMiddleware` 包裹整个 ASGI 应用：

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

fastapi_app = FastAPI()

app = CORSMiddleware(
    app=fastapi_app,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

开发环境可以按需放宽来源；启用凭证时，生产环境应列出明确的 Origin。

全局异常处理器只负责返回稳定的错误结构：

```python
from fastapi import Request
from fastapi.responses import JSONResponse

@fastapi_app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"},
    )
```

不要把原始异常内容直接返回给客户端，详细堆栈应进入日志。

## SQLAlchemy 可选筛选条件

先建立基础查询，再按输入逐步增加筛选，最后应用分页：

```python
def search_documents(
    db: Session,
    keyword: str,
    page_num: int = 1,
    page_size: int = 20,
    filters: dict | None = None,
):
    query = (
        db.query(Document)
        .filter(
            Document.title.like(f"%{keyword}%"),
            Document.deleted_at.is_(None),
        )
    )

    if filters:
        query = query.filter_by(**filters)

    return (
        query
        .order_by(Document.created_at.desc())
        .offset((page_num - 1) * page_size)
        .limit(page_size)
        .all()
    )
```

筛选必须发生在 `offset` 和 `limit` 之前，否则分页得到的不是完整过滤结果。对外暴露的筛选字段还应建立白名单，不要把任意字典直接交给数据库层。
