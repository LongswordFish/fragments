#Health Check Test
GET http://localhost:8080/not_exists

# We should get back an HTTP 1.1 200 response
HTTP/1.1 404

# Extra checks to perform against the response
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with { ..., "message":{} }
jsonpath "$.error" != null
# We expect to get back a JSON response with { ..., "message":{"code":404,"message":"not found"} }
jsonpath "$.error.code" == 404
# We expect to get back a JSON response with { ..., "message":{"code":404,"message":"not found"} }
jsonpath "$.error.message" isString

