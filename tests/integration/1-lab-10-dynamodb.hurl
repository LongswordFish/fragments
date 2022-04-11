# POST a new JSON fragment to http://localhost:8080 as an authorized user. 
# The fragment's body should be the JSON value, { "service": "DynamoDB" }.

POST http://localhost:8080/v1/fragments

# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a json fragment
Content-Type: application/json
#body
{
   "service": "DynamoDB"
}


# Confirm that the server returns a 201
# capture the Location header value and the fragment's id in variables named fragment1_url and fragment1_id
HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# GET the fragment info (i.e., metadata) for the fragment you just created
# confirm that the server returns a 200 and that all of the metadata properties match what you expect
GET {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: application/json

[Asserts]
# We expect to get back a JSON response with the data
jsonpath "$.service" == "DynamoDB"

# POST a second Markdown fragment to http://localhost:8080 as the same authorized user. 
# The fragment's body should be the Markdown value, DynamoDB is **great**..
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a md 
Content-Type: text/markdown
```DynamoDB is **great**.```


# Confirm that the server returns a 201
HTTP/1.1 201

# capture the Location header value and the second id in variables named fragment2_url and fragment2_id
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# GET the fragment info (i.e., metadata) for the fragment you just created
# confirm that the server returns a 200 and that all of the metadata properties match what you expect
GET {{fragment2_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: text/markdown

[Asserts]
# We expect to get back a JSON response with metadata info
body == "DynamoDB is **great**."

# GET all of the fragments for the same authorized user without expanding them (i.e., just get back the IDs) 
# and confirm that the list of fragments includes the two id values you captured above
GET http://localhost:8080/v1/fragments

# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Confirm that the server returns a 200
HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" count == 2
jsonpath "$.fragments[0]" matches "^[A-Za-z0-9_-]+$"
jsonpath "$.fragments[1]" matches "^[A-Za-z0-9_-]+$"
jsonpath "$.fragments[0]" contains "{{fragment1_id}}"
jsonpath "$.fragments[1]" contains "{{fragment2_id}}"

# DELETE the first fragment you created above
DELETE {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Confirm that the server returns a 200
HTTP/1.1 200

# Try to GET the first fragment again using the url you captured above as the authorized user.
GET {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Confirm that the server returns a 404, since the fragment should be deleted.
HTTP/1.1 404

# GET all of the fragments for the same authorized user without expanding them
# confirm that the first id is NOT included but that the second id is (i.e., that the second was deleted).
GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" count == 1
jsonpath "$.fragments[0]" contains "{{fragment2_id}}"
