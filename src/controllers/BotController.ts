import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

let sessions: { [key: string]: any } = {}; // Objeto para armazenar sessões dos usuários

class BotController {
  async RunBot(request: Request, response: Response) {
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
      } else if (option != 'start' && option != 'Ver Menu' && !sessions[userId].name) {
        try {
          const normalizedName = option.toLowerCase(); // Converte o nome para minúsculo
          const user = await prisma.user.findUnique({
            where: { name: normalizedName }
          });

          if (user) {
            response.status(400).json({ error: "Usuário já cadastrado" });
            return;
          }

          await prisma.user.create({
            data: { name: normalizedName }
          });

          sessions[userId].name = normalizedName;

          res = {
            message: `Bem-vindo ${option}! Escolha uma opção:`,
            menu: ['Ver Menu', 'Ver Promoções']
          };
        } catch (error) {
          response.status(500).send(error);
          return;
        }
      } else if (option === 'Ver Menu') {
        res = {
          message: `Aqui estão os sabores disponíveis:`,
          menu: ['Margherita', 'Calabresa', 'Portuguesa']
        };
      } else if (['Portuguesa', 'Margherita', 'Calabresa'].includes(option)) {
        sessions[userId].sabor = option;

        res = {
          message: 'Quantidade:',
          menu: ['1', '2', '3', '4', '5', 'voltar']
        };

      } else if (option === 'Ver Promoções') { 
        res = { 
          message: 'As promoções atuais são: 10% de desconto na Margherita!', menu: ['voltar ao início'],

         };

      } else if (['1', '2', '3', '4', '5'].includes(option)) {
        sessions[userId].quantidade = parseInt(option);

        res = {
          message: `Seu Pedido Atual é: ${sessions[userId].quantidade} Pizza's de ${sessions[userId].sabor}, CONFIRMAR?`,
          menu: ['sim', 'não']
        };
      } else if (option === 'sim') {
        try {
          await prisma.pizza.create({
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
            menu: ['voltar ao início']
          };

          // Limpar sessão após confirmar pedido
          delete sessions[userId];
        } catch (error) {
          response.status(500).send(error);
          return;
        }
      } else if (option === 'não') {
        res = {
          message: 'Pedido não confirmado!',
          menu: ['voltar ao início']
        };
      } else {
        res = {
          message: 'Opção não reconhecida. Tente novamente.',
          menu: ['voltar ao início']
        };
      }

      response.json(res);
    } catch (error) {
      response.status(500).send(error);
    }
  }
}

export default new BotController();
