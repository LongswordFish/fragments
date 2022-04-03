# POST a new text fragment to http://localhost:8080
# as an authorized user. The fragment's body should be the string, Hello S3!.
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a plain text fragment
Content-Type: text/plain
# Body of the request goes in ```...``` when it's a string
```Hello S3!```


# Confirm that the server returns a 201, 
# and capture the Location header value to a variable named url
HTTP/1.1 201
[Captures]
url: header "Location"


# GET the fragment you just created using the url as an authorized user.
# Confirm that the server returns a 200, 
# that the type of the fragment is text/plain, and that the body is equal to Hello S3!

GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello S3!"

#DELETE the fragment using the url as an authorized user.
#Confirm that the server returns a 200.

DELETE {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200

#Try to GET the fragment again using the url as an authorized user.
#Confirm that the server returns a 404, since the fragment should be deleted.

GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 404
