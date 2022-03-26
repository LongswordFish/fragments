# tests/integration/post-fragments-unauthenticated.hurl
# Confirm that posting a fragment when not authenticated produces a 401 error

# unauthenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```

# 1. We expect to get back an HTTP 401
HTTP/1.1 401
# We have various assertions about the response that we want to check 
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with { ..., "message":{} }
jsonpath "$.error" != null
# We expect to get back a JSON response with { ..., "message":{"code":401,"message":"not found"} }
jsonpath "$.error.code" == 401
# We expect to get back a JSON response with { ..., "message":{"code":401,"message":"not found"} }
jsonpath "$.error.message" isString
