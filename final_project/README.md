Practice-Project

Log in first so the session cookie is created, then delete the review with this cURL command:

```bash
curl -X POST http://localhost:5000/customer/login -H 'Content-Type: application/json' -d '{"username":"your-username","password":"your-password"}' -c cookie.txt
```

After that, delete the review with this cURL command:

```bash
curl -X DELETE http://localhost:5000/customer/auth/review/1 -b cookie.txt
```

Successful deletion returns a JSON response with the review deletion message, the ISBN, and the updated reviews list.