const { clienteModel } = require("../models/clienteModel.js");

const clienteController = {

     /**
     * @async
     * @function criarCliente
     * @description Cadastra um novo cliente no sistema após validar todos os campos obrigatórios
     * @param {*} req - Objeto da requisição contendo nomeCliente, cpfCliente, telefone, email e endereco no corpo
     * @param {*} res - Objeto da resposta enviado ao cliente HTTP
     * @returns {Promise<Object>} Retorna uma mensagem de sucesso e o ID do cliente cadastrado
     */

    criarCliente: async (req, res) => {
        try {
            const { nomeCliente, cpfCliente, telefone, email, endereco } = req.body;

            if (!nomeCliente || !cpfCliente || !telefone || !email || !endereco) {
                return res.status(400).json({ erro: "Campos obrigatórios não foram preenchidos" });
            }

            //verifica se CPF do cliente já está no sistema
        const cpfExiste = await clienteModel.buscarCpf(cpfCliente);

        if (cpfExiste.length > 0) {
            return res.status(400).json({ erro: "CPF já cadastrado no sistema!" });
        }

        // verifica se o email esta duplicado
        const emailExiste = await clienteModel.buscarEmail(email);
        if (emailExiste.length > 0) {
            return res.status(400).json({ erro: "E-mail já cadastrado no sistema!" });
        }

            const result = await clienteModel.inserirCliente(
                nomeCliente,
                cpfCliente,
                telefone,
                email,
                endereco
            );

            res.status(200).json({
                mensagem: "Usuário cadastrado com sucesso!",
                idCliente: result.idCliente
            });

        } catch (error) {
            console.error("Erro ao cadastrar usuário:", error);
            res.status(500).json({ erro: "Erro no servidor ao cadastrar usuário!" });
        }
    },

    /**
     * @async
     * @function listarClientes
     * @description Lista todos os clientes cadastrados ou apenas um cliente específico quando fornecido um ID
     * @param {*} req - Objeto da requisição. Pode conter idCliente em req.query
     * @param {*} res - Objeto da resposta enviado ao cliente HTTP
     * @returns {Promise<Array|Object>} Retorna a lista completa de clientes ou o cliente correspondente ao ID
     */

    listarClientes: async (req, res) => {
        try {
            const { idCliente } = req.query;

            if (idCliente) {
                if (idCliente.length !== 36) {
                    return res.status(400).json({ erro: "ID do cliente inválido" });
                }

                const cliente = await clienteModel.buscarUm(idCliente);
                return res.status(200).json(cliente);
            }

            const clientes = await clienteModel.buscarTodos();

            return res.status(200).json(clientes);

        } catch (error) {
            console.error("Erro ao listar clientes:", error);
            res.status(500).json({ erro: "Erro ao buscar clientes" });
        }
    },

     /**
     * @async
     * @function atualizarCliente
     * @description Atualiza os dados de um cliente existente. Caso algum campo não seja enviado, mantém o valor atual
     * @param {*} req - Objeto da requisição contendo o idCliente em params e os novos dados no body
     * @param {*} res - Objeto da resposta enviado ao cliente HTTP
     * @returns {Promise<Object>} Retorna uma mensagem confirmando a atualização do cliente
     */

    atualizarCliente: async (req, res) => {
        try {
            const { idCliente } = req.params; 
            const { nomeCliente, cpfCliente, telefone, email, endereco } = req.body;

            // verifica se o ID é válido
            if (idCliente.length !== 36) {
                return res.status(400).json({ erro: "ID do cliente inválido" });
            }

            // busca o cliente atual
            const cliente = await clienteModel.buscarUm(idCliente);

            if (!cliente || cliente.length !== 1) {
                return res.status(400).json({ erro: "Cliente não encontrado" });
            }

            const atual = cliente[0];

            // valida se CPF está vindo no body
        if (cpfCliente) {

            // não permite atualizar o mesmo CPF já existente
            if (cpfCliente === atual.cpfCliente) {
                return res.status(400).json({ erro: "O CPF atual não pode ser igual ao antigo" });
            }

            //verifica se o CPF pertence a outro cliente
            const cpfExiste = await clienteModel.buscarCpf(cpfCliente);

            if (cpfExiste.length > 0) {
                return res.status(400).json({ erro: "Este CPF já foi cadastrado" });
            }
        }

         //validação do email
        if (email) {

            // não permite atualizar o mesmo email se já existente
            if (email === atual.emailCliente) {
                return res.status(400).json({ erro: "O email atual não pode ser igual ao antigo" });
            }

            // verifica se o email pertence a outro cliente
            const emailExiste = await clienteModel.buscarEmail(email);

            if (emailExiste.length > 0) {
                return res.status(400).json({ erro: "Este email já foi cadastrado" });
            }
        }

            // usa o ?? para manter o valor antigo quando não vier no body
            const nomeNovo = nomeCliente ?? atual.nomeCliente;
            const cpfNovo = cpfCliente ?? atual.cpfCliente;
            const telNovo = telefone ?? atual.telefone;
            const emailNovo = email ?? atual.email;
            const endNovo = endereco ?? atual.endereco;

            await clienteModel.atualizarCliente(
                idCliente,
                nomeNovo,
                cpfNovo,
                telNovo,
                emailNovo,
                endNovo
            );

            res.status(200).json({ mensagem: "Cliente atualizado com sucesso!" });

        } catch (erro) {
            console.log("Erro ao atualizar cliente:", erro);
            return res.status(500).json({ erro: "Erro interno ao atualizar cliente" });
        }
    },

    /**
     * @async
     * @function deletarCliente
     * @description Remove um cliente do sistema com base no ID fornecido
     * @param {*} req - Objeto da requisição contendo idCliente em params
     * @param {*} res - Objeto da resposta enviado ao cliente HTTP
     * @returns {Promise<Object>} Retorna uma mensagem confirmando que o cliente foi deletado
     */

  deletarCliente: async (req, res) => {
    try {
        const { idCliente } = req.params;

        // verifica se o ID tem 36 caracteres
        if (!idCliente || idCliente.length !== 36) {
            return res.status(400).json({ erro: "ID do cliente inválido" });
        }

        // busca o cliente no banco
        const cliente = await clienteModel.buscarUm(idCliente);

        // verifica se encontrou algum cliente //array.isarray verifica se um valor é um array
        if (!cliente || !Array.isArray(cliente) || cliente.length !== 1) {
            return res.status(400).json({ erro: "Cliente não encontrado!" });
        }

        //não permite deletar clientes que tenham pedido
        const possuiPedidos = await clienteModel.existePedidos(idCliente);

        if (possuiPedidos) {
            return res.status(409).json({
                erro: "Não é possível deletar um cliente que possui pedidos cadastrados."
            });
        }

        // deleta o cliente
        await clienteModel.deletarCliente(idCliente);

        return res.status(200).json({ mensagem: "Cliente deletado com sucesso!" });

    } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        return res.status(500).json({ erro: "Cliente não pode ser deletado pois hà pedidos em andamento" });
    }
},
};

module.exports = { clienteController };
