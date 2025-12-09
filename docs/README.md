# API Reference

### Clientes 

#### GET /clientes
- **Descrição**: Obtém uma lista de todos os clientes já cadastrados
- **Reponse**: Array dos clientes

### GET /clientes?idCliente=idCliente
- **Descrição**: Obtém uma lista de apenas um cliente 
- **Reponse**: Array do cliente

#### POST /clientes
- **Descrição**: Criar um novo cliente
- **Body**:

{
    "nomeCliente": "clienteExemplo",
    "cpfCliente": "12345678909",
    "telCLiente": "19 123459876",
    "emailCliente: "emailExemplo@gmail.com",
    "endCliente": "logradouro, número, bairro, cidade, estado, CEP"

}

- **Reponse**: 

{
    "message": "Cliente cadastrado com sucesso!"
}


#### PUT /Clientes/idCliente
- **Descrição**: Atualizar cliente já existente
- **Body**: 

{
    "nomeCliente": "clienteAtual",
    "cpfCliente": "12345678909", -- CPF Atual
    "telCLiente": "19 123459876", -- telefone Atual
    "emailCliente: "emailExemplo@gmail.com", -- email Atual
    "endCliente": "logradouro, número, bairro, cidade, estado, CEP" -- endereço Atual
}

- **Reponse**: 

{
    "message": "Cliente atualizado com sucesso!"
}

### DELETE /Clientes/idCliente
- **Descrição**: Deletar cliente
- **Reponse**: 

{
    "message": "Cliente deletado com sucesso!"
}


### Pedidos

#### GET /Pedidos
- **Descrição**: Obtém uma lista dos pedidos
- **Response**: Array dos pedido

#### POST /Pedidos
- **Descrição**: Cria um novo pedido
- **Body**: 

{
    "idCliente": "idCliente",
    "dataPedido": "0000-00-00", 
    "distancia": 00 KM, 
    "pesoCarga": 00 KG, 
    "valorKm": 00,00 , 
    "valorKg": 00,00 ,
    "tipoEntrega": "normal ou entrega",
    "statusEntrega": "calculado, em transito, entregue, cancelado"

}

- **Response**: 

{
    message: "Produto cadastrado com sucesso!"
}


#### PUT /Pedidos/idPedido
- **Descrição**: Atualizar informações dos pedidos
- **Body**:
`
{
    "idCliente": "idCliente",
    "dataPedido" = 0000-00-00, -- data Atualizada
    "distancia" = 00 KM, -- distancia Atualixada
    "pesoCarga" = 00 KG, -- peso Atualizado
    "valorKm" = 00,00 , -- valor atual
    "valorKg" = 00,00 , -- valor atual
    "tipoEntrega": "normal ou entrega", - tipo da entrega atualizado
    "statusEntrega": "calculado, em transito, entregue, cancelado" - status da entrega atualizado
}
`
- **Response**:

{
    message: "Pedido atualizado com sucesso!"
}


#### DELETE /Pedidos/idPedido
- **Descrição**: Deletar pedido 
- **Response**:
`
{
    message: "Pedidos deleta com sucesso!"
}
`

### Entregas

### GET /entregas
- **Descrição**: Obtém uma lista das entregas
- **Response**: Array das entregas

#### DELETE /Pedidos/idEntrega
- **Descrição**: Deletar entrega 
- **Response**:
`
{
    message: "Entrega deleta com sucesso!"
}
`