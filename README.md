# Reading List Manager — Assignment 9

A full-stack Reading List application built with a Node.js + Express 5 REST API (`server/`) and a React + Vite single-page client (`client/`).

## Installation & Running

### 1. Backend Server (`server/`)
1. Navigate to the server folder and install dependencies:
   ```bash
   cd server
   npm install

   ## Testing Evidence (`curl --include` & CORS Preflight)

### 1. `200 OK` List with Combined Query Parameters (`GET /api/books?genre=science&sort=year&order=desc`)
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 218
ETag: W/"da-Veq3dlS976TOlbPQ+aPiI3jjwJs"
Date: Tue, 24 Nov 2026 18:58:31 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":6,"title":"Project Hail Mary","author":"Andy Weir","year":2021,"genre":"science","read":false,"rating":null},{"id":1,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"science","read":true,"rating":5}]

### 2. `200 OK` Single Book (`GET /api/books/1`)
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 101
ETag: W/"65-imtguC0biqtv8FVKP54vGf/dVoY"
Date: Tue, 24 Nov 2026 18:59:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"science","read":true,"rating":5}

### 3. `201 Created` with `Location` Header (`POST /api/books`)
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 42
ETag: W/"2a-Kp6r6EoQdfa9J08PVdn0M1MJ9NY"
Date: Tue, 24 Nov 2026 18:59:30 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Malformed JSON in request body"}curl: (3) URL rejected: Port number was not a decimal number between 0 and 65535
curl: (6) Could not resolve host: C.
curl: (3) unmatched close brace/bracket in position 65:
Martin","year":2008,"genre":"non-fiction","read":true,"rating":5}

### 4. `400 Bad Request` Invalid Body (`POST /api/books`)
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 42
ETag: W/"2a-Kp6r6EoQdfa9J08PVdn0M1MJ9NY"
Date: Tue, 24 Nov 2026 18:59:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Malformed JSON in request body"}curl: (3) unmatched close brace/bracket in position 78:
Book","author":"Nobody","year":2020,"genre":"fiction","read":false,"rating":4}

### 5. `400 Bad Request` Repeated Query Parameter (`GET /api/books?genre=fiction&genre=history`)
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 58
ETag: W/"3a-a+65h+HmzMUgylh2hyrr7Y1/tk0"
Date: Tue, 24 Nov 2026 19:00:05 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Repeated query parameter is not allowed: genre"}

### 6. `404 Not Found` Missing Book (`GET /api/books/999`)
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Tue, 24 Nov 2026 19:00:15 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}

### 7. `409 Conflict` Duplicate Book (`POST /api/books`)
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 42
ETag: W/"2a-Kp6r6EoQdfa9J08PVdn0M1MJ9NY"
Date: Tue, 24 Nov 2026 19:00:48 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Malformed JSON in request body"}curl: (3) unmatched close brace/bracket in position 62:
herbert","year":1965,"genre":"science","read":true,"rating":5}

### 8. `PUT` vs `PATCH` on the Same Book (`/api/books/7`)
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Tue, 24 Nov 2026 19:01:08 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}

### 9. `204 No Content` Delete Followed by `404 Not Found` Repeated Delete (`DELETE /api/books/7`)
{"error":"Book not found"}HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Tue, 24 Nov 2026 19:01:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

### 10. `GET /api/stats` Before and After Delete
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 137
ETag: W/"89-kOCbJW+fdUWyEUX3CmnF7uZ+tKQ"
Date: Tue, 24 Nov 2026 19:01:45 GMT
Connection: keep-alive
Keep-Alive: timeout=5

### Browser CORS `OPTIONS` Preflight Evidence
When triggering a `POST` or `DELETE` request from `http://localhost:5173`, Chrome DevTools Network tab captured the preflight `OPTIONS /api/books` request returning `204 No Content` with:
```http
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type
Vary: Access-Control-Request-Headers
```

## Reasoning Questions

1. **Parameters:** The book's `id` identifies a specific single resource in the REST hierarchy (`/api/books/:id`), whereas `genre` and `sort` are optional filtering and ordering modifiers applied to the entire collection (`/api/books`). If `id` were placed in the query string (`/api/books?id=1`), endpoints like `PUT`, `PATCH`, and `DELETE` would no longer address a distinct resource URI and would complicate RESTful routing and `Location` headers.
2. **Body parsing (Experiment):** Moving `app.use(express.json())` below the routes caused `req.body` inside `POST /api/books` to be `undefined`. Consequently, `validateBookPayload(req.body)` rejected the request and the server returned `400 Bad Request` (`{"error":"Request body must be a JSON object"}`).
3. **One response (Experiment):** Removing `return` before an early `res.status(404).json(...)` caused Express to send the 404 response and continue executing the remaining handler code, attempting to send a second response for the same request. Node/Express threw `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client` in the server console.
4. **PUT and PATCH:** `PUT /api/books/:id` is the better choice when editing the entire book record in the edit form where all fields (`title`, `author`, `year`, `genre`, `read`, `rating`) are submitted as a complete replacement. `PATCH /api/books/:id` is the better choice when toggling a single field such as `read` or updating only `rating` directly from a book card without resending unchanged fields.
5. **CORS (Experiment):** Setting `CLIENT_ORIGIN=http://localhost:9999` caused the browser console to block the response with a CORS policy error (`Access-Control-Allow-Origin` mismatch). The server still logged and processed the incoming request because CORS is enforced by the browser—not the server—which is also why `curl` continues to work unaffected by CORS headers.
6. **Validation:** Client-side checks only improve user experience and can be bypassed easily using `curl`, Postman, or browser DevTools. The server must validate all inputs independently to protect data integrity, prevent invalid state (such as a rating on an unread book), and enforce duplicate constraints.
7. **State:** Restarting the Express server reset all added, edited, and deleted books back to the initial 6 seed books. This shows that the data lives strictly in volatile RAM inside the Node.js process, and persisting data across restarts requires an external database or file-backed storage.