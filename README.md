# MatchPoints [Live Link](https://matchpoints.org)
MatchPoints is a Full-stack web round-robin rating system. It provides a platform for round-robin organizers to:
* group players
* record results
* calculate scores

And allow users to:
* query results based on date
* query their indiviual old results

MatchPoints utilizes Redis to reduce the number of times data is fetched the database, thus reduce latency in many requests.

## Expected Features (MVP)
 - [x] Arrange groups for players based on ratings
 - [x] Allow organizers to enter results
 - [x] Generate Score Sheets (pdf) for users
 - [x] Calculate scores automatically based on default algorithms
 - [x] Provide a platform for participants to query their individual past results
 - [x] Provide a platform for participants to query results based on event date

## Bonus features (Will be implemented in the future)
 - [x] Temporary Save sessions and allow users to retrieve results
 - [x] Allow users to import players with csv or json files
 - [ ] Allow Users to update previous saved results
 - [ ] Allow Users to customize scoring algorithm

## Languages:
 - Front-end: React with Redux architecture
 - Back-end: Node.js/Express.js
 - Database: MongoDB with Mongoose ODM + Redis cache
 - Deployed on Amazon EC2 with ElastiCache

## Implementation:
MatchPoint allows users to dynamically change the range of players that is allowed in a group, then offers the possible group arrangements that fulfill the criteria.

### Redis as a temporary store
Aside from using Redis as a cache store, Redis provides a way for caching pdf links, expiring and cleaning up old pdfs that are generated using html5-to-pdf library.

Upon creation of pdfs, the filenames are stored in Redis and are set to expire after 15 minutes. Once expired, a listener which has been listening on the "expired" event, will remove the files.

### Roundrobin scheduler
The Roundrobin scheduler is based on this algorithm ([link](http://stackoverflow.com/a/6649732)). The algorithm is created based on a structure that is similar to a ring buffer.

Todo:
- [ ] Finish Elixir Implementation
- [ ] React Native iOS
- [ ] React Native with Android
  - [ ] Link to App
  - [ ] Sign Up Screen (post token)
  - [ ] Log In Screen
  - [ ] Check In Screen (to multiple clubs)
- [ ] User Geolocation
- [ ] Geolocation search (look into elastisearch)
