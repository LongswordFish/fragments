# tests/integration/post-fragments-unsupported-type.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a mp4 fragment
Content-Type: video/mp4
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```

# 1. We expect to get back an HTTP 415
HTTP/1.1 415
# We have various assertions about the response that we want to check 
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with { ..., "message":{} }
jsonpath "$.error" != null
# We expect to get back a JSON response with { ..., "message":{"code":404,"message":"not found"} }
jsonpath "$.error.code" == 415
# We expect to get back a JSON response with { ..., "message":{"code":404,"message":"not found"} }
jsonpath "$.error.message" isString
