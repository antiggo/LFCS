# Workshop v1.0.0

## Quick start

Launch project-serever:

```
> gulp --project=test --port=8050
```

Default port is 8060, so you can only specify your project

```
> gulp --project=projectname
```

And here it is: http://localhost:8060/projects/projectname/pages/index.html

Project is a subdirectory in `projects/`, which replicates all the root sections – its own `blocks/`, `assets/`, `lib/` and `pages/`.

---

For public hosting please use github-pages feature. There's also a lot to tell, but maybe later.