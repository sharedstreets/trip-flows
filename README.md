# trip-flows
experimental trip flow aggregator
---

![](sample.png)

## install

_dependencies do not compile on Windows!_

```sh
npm i -g trip-flows
```

## use

### build

```sh
trip-flows build \
  --bbox "-74.20303344726562,40.531545551348394,-73.55484008789062,41.017210578228436" \
  --traces ./traces.json
```

### serve

```sh
trip-flows serve
open localhost:5000
```
