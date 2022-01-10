## Requisitos funcionais

- Estado interno deve iniciar sempre vazio.
- Estado da aplicação deve estar sempre em memória
- O payload de entrada será um arquivo .json
- As informações devem ser processadas na ordem que estão no arquivo
- Deve escrever todas as operações em um arquivo de saída, com o resultado de cada uma das operações recebidas como entrada (.json)

## Use cases

### Inicializar conta

- Deve inicializar uma conta atrelada a um número de documento (ex: CPF) ✅
- Deve falhar se a conta ja foi inicializada (já existe um número de documento associado a outra conta) ✅
- Deve falhar se o payload estiver incorreto durante a inicialização da conta

### Efetuar transação

- Deve efetuar uma transação atômica de saldo entre duas contas existentes
- Deve falhar caso uma das contas não exista (não foi inicializada)
- Deve falhar caso o limite disponível para o emissor seja menor que o valor da transferência
- Deve falhar caso uma transação de igual valor, emissor e receptor tenha ocorrido nos X minutos anteriores a transação atual (parametrizar via ENV)

### Visualizar histórico de transações

- Deve retornar o histórico de transações completo da conta digital do solicitante
- Deve falhar caso a conta não exista (não foi inicializada)
