const { clienteModel } = require("../models/clienteModel.js");

const clienteController = {

    criarCliente: async (req, res) => {
        try {
            const { nomeCliente, cpfCliente, telefone, email, endereco } = req.body;

            // validação correta
            if (!nomeCliente || !cpfCliente || !telefone || !email || !endereco) {
                return res.status(400).json({ erro: "Campos obrigatórios não foram preenchidos" });
            }

            const result = await clienteModel.inserirCliente(
                nomeCliente,
                cpfCliente,
                telefone,
                email,
                endereco
            );

            res.status(201).json({
                mensagem: "Usuário cadastrado com sucesso!",
                idCliente: result.idCliente
            });

        } catch (error) {
            console.error("Erro ao cadastrar usuário:", error);
            res.status(500).json({ erro: "Erro no servidor ao cadastrar usuário!" });
        }
    },

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

    atualizarCliente: async (req, res) => {
        try {
            const { idCliente } = req.params; // aceitar um numero variavel
            const { nomeCliente, cpfCliente, telefone, email, endereco } = req.body;

            // verifica se o ID é válido
            if (idCliente.length !== 36) {
                return res.status(400).json({ erro: "ID do cliente inválido" });
            }

            // busca o cliente atual
            const cliente = await clienteModel.buscarUm(idCliente);

            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "Cliente não encontrado" });
            }

            const atual = cliente[0];

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

   deletarCliente: async (req, res) => {
    try {
        const { idCliente } = req.params;

        // verificase o ID tem 36 caracteres
        if (!idCliente || idCliente.length !== 36) {
            return res.status(400).json({ erro: "ID do cliente inválido" });
        }

        // busca o cliente no banco
        const cliente = await clienteModel.buscarUm(idCliente);

        // verifica se encontrou algum cliente //array.isarray verifica se um valor é um array
        if (!cliente || !Array.isArray(cliente) || cliente.length !== 1) {
            return res.status(404).json({ erro: "Cliente não encontrado!" });
        }

        // deleta o cliente
        await clienteModel.deletarCliente(idCliente);

        return res.status(200).json({ mensagem: "Cliente deletado com sucesso!" });

    } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        return res.status(500).json({ erro: "Erro interno ao deletar cliente" });
    }
},

};

module.exports = { clienteController };
