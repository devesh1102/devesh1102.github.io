# Problem
Addressing the problem of read in application


## 1. Database optimization
* use INdex on the rows used in query. the indexding reduces the timecomplexity to log(n) vs n
* Use denormalized data.
    * pro: read fast
    * con: write slow


## 2. Read Replicas
* Useful when too many read reuests are comming
* create the copy of data into many clusters. the server can read form any cluster. 
* sacrificing read over write
* diffucult to  write. Either you miss consistency or avalability

## 3. Sharding
* divide the database into multiple databases. Note here we are not replicatig data
* we need hashfunction to divide
* we would use consistent hashing
* choosing a key is essential as load needs to trnasfered evenly
* is primarily a write scaling technique

## 4. application cachin

## 5. CDN and Edge Caching