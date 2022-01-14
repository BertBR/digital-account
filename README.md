<center><img src="https://www.paymentsjournal.com/wp-content/uploads/2019/09/banking-4397449_1920.jpg" width=500 alt="Digital account"/>

# Digital Account :bank:
</center>

### :gear: How it works 

- This is a simple application to read an `input.json` file with some bank operations (initialize_account, transaction, transaction_history), process all operations then write in a `output.json` file.
---
### :open_file_folder: Project structure
All directories bellow is inside `/src` dir
Dir/File| Meaning
:-----:|:-----:
`operations`|Root dir for operations
`controllers`|API layer
`interfaces`|Project interfaces
`models`|All operation types
`services`|Services and their tests suites
`shared`|Shared resources through all project
`storage`|Data layer
`operations.module`|Service module 

---
### :classical_building: Project Architecture
I've decide to use a couple of techniques and patterns in this project, to keep it simple (KISS).

Inspired in Hexagonal and Clean Architecture concepts, but keeping Nest framework directory structure organization, I did my best to try to follow something like this...
![](https://www.researchgate.net/profile/Luiz-Fernando-Assis/publication/337224879/figure/fig3/AS:824953234538497@1573695586192/TerraBrasilis-Hexagonal-Architecture-Ports-and-Adapters-Design-Pattern.jpg)

Those are widely-used / well-known concepts focused to isolate the web application domain to "external world". Adding abstraction between application layers we can test our classes easily. But it's a very small project and not worth it apply all concepts here. I used these concepts as inspiration only.

---
### :microscope: Libs and Frameworks

I've choose some libs and frameworks according 
- [nest](https://docs.nestjs.com/)
  -  High abstraction level
  -  Easy development new features
  -  Huge active community
  -  Excellent documentation
  -  Powerful and secure (has own scoped package in NPM)
  -  Easy to test (Jest included)
  
- [date-fns](https://date-fns.org/)
  - Easy to handle data and time operation
---
### :floppy_disk: How to run

**Container**
You will need [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/)

After get both...
```bash
git clone https://github.com/BertBR/digital-account.git
cd digital-account
make run
```
**Local**
You will need only [Node.js](https://nodejs.org/en/download/) installed in your local machine.
After get it...
```bash
git clone https://github.com/BertBR/digital-account.git
cd digital-account
npm i && npm start:dev
```
**Testing via api**
Now make a request...
```bash
curl -X POST http://127.0.0.1:3000/operations/run
```

and you should see an `output.json` file in `/src` dir containing all processed operations...

---
## :recycle: How to contribute

- Fork it!
- Create a new branch with your feature from **main**: `git checkout main && git checkout -b my-feature`
- Commit yout changes: `git commit -m 'feat: My new feature'`
- Push your commits and open a Pull Request: `git push origin my-feature`

---

### :memo: License
This project is under the MIT license. See the [LICENSE](https://github.com/BertBR/digital-account/blob/main/LICENSE) for more information
___
### <p align="center">  Enjoy ❤️ </p>