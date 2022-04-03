DELETE http://localhost:8080/v1/fragments/XUo9rqTOY2m1EHJp4FNHR
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200

#Try to GET the fragment again using the url as an authorized user.
#Confirm that the server returns a 404, since the fragment should be deleted.

GET http://localhost:8080/v1/fragments/XUo9rqTOY2m1EHJp4FNHR
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 404
