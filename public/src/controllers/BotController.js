"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let sessions = {}; // Objeto para armazenar sessões dos usuários
class BotController {
    RunBot(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { option, userId } = request.body;
                let res;
                // Inicialize a sessão do usuário se não existir
                if (!sessions[userId]) {
                    sessions[userId] = {
                        name: '',
                        sabor: '',
                        quantidade: 0,
                    };
                }
                if (option === 'start' || option === 'voltar ao início') {
                    delete sessions[userId];
                    res = {
                        message: 'Para começar, Digite seu nome: '
                    };
                }
                else if (option != 'start' && option != 'Ver Menu' && !sessions[userId].name) {
                    try {
                        const normalizedName = option.toLowerCase(); // Converte o nome para minúsculo
                        const user = yield prisma.user.findUnique({
                            where: { name: normalizedName }
                        });
                        if (user) {
                            response.status(400).json({ error: "Usuário já cadastrado" });
                            return;
                        }
                        yield prisma.user.create({
                            data: { name: normalizedName }
                        });
                        sessions[userId].name = normalizedName;
                        res = {
                            message: `Bem-vindo ${option}! Escolha uma opção:`,
                            menu: ['Ver Menu', 'Ver Promoções']
                        };
                    }
                    catch (error) {
                        response.status(500).send(error);
                        return;
                    }
                }
                else if (option === 'Ver Menu') {
                    res = {
                        message: `Aqui estão os sabores disponíveis:`,
                        menu: ['Margherita', 'Calabresa', 'Portuguesa']
                    };
                }
                else if (['Portuguesa', 'Margherita', 'Calabresa'].includes(option)) {
                    sessions[userId].sabor = option;
                    res = {
                        message: 'Quantidade:',
                        menu: ['1', '2', '3', '4', '5', 'voltar']
                    };
                }
                else if (option === 'Ver Promoções') {
                    res = {
                        message: 'As promoções atuais são: 10% de desconto na Margherita!', menu: ['voltar ao início'],
                    };
                }
                else if (['1', '2', '3', '4', '5'].includes(option)) {
                    sessions[userId].quantidade = parseInt(option);
                    res = {
                        message: `Seu Pedido Atual é: ${sessions[userId].sabor} ${sessions[userId].quantidade}x, CONFIRMAR?`,
                        menu: ['sim', 'não']
                    };
                }
                else if (option === 'sim') {
                    try {
                        yield prisma.pizza.create({
                            data: {
                                user: sessions[userId].name,
                                sabor: sessions[userId].sabor,
                                quant: sessions[userId].quantidade
                            }
                        });
                        res = {
                            message: 'Pedido criado com sucesso!',
                            sabor: sessions[userId].sabor,
                            quant: sessions[userId].quantidade,
                            menu: ['voltar ao início', 'ver pedidos']
                        };
                        // Limpar sessão após confirmar pedido
                        delete sessions[userId];
                    }
                    catch (error) {
                        response.status(500).send(error);
                        return;
                    }
                }
                else if (option === 'não') {
                    res = {
                        message: 'Pedido não confirmado!',
                        menu: ['voltar ao início']
                    };
                }
                else {
                    res = {
                        message: 'Opção não reconhecida. Tente novamente.',
                        menu: ['voltar ao início']
                    };
                }
                response.json(res);
            }
            catch (error) {
                response.status(500).send(error);
            }
        });
    }
}
exports.default = new BotController();
