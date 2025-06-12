import { prisma } from "../../lib/prisma.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET
export default {
  async login(req, res) {
    try {
      const { cpf, password, role } = req.body;
      
      // Verifica se a SECRET_KEY está definida
      if (!SECRET_KEY) {
        console.error('JWT_SECRET não está definido no ambiente');
        return res.status(500).json({ error: "Erro de configuração do servidor" });
      }

      let payload;
      let user;

      // Busca o usuário conforme o role
      if (role === 'admin') {
        const admin = await prisma.admin.findUnique({ where: { cpf } });
        if (!admin) return res.status(404).json({ error: "Admin não cadastrado" });
        
        user = admin;
        payload = { 
          adminId: admin.id, 
          role: 'admin', 
          user: { 
            name: admin.name, 
            phone: admin.phone, 
            picture: admin.picture 
          } 
        };

      } else if (role === 'teacher') {
        const teacher = await prisma.teacher.findUnique({ where: { cpf } });
        if (!teacher) return res.status(404).json({ error: "Professor não cadastrado" });
        
        user = teacher;
        payload = { 
          teacherId: teacher.id, 
          role: 'teacher', 
          user: { 
            name: teacher.name, 
            phone: teacher.phone, 
            picture: teacher.picture 
          } 
        };

      } else if (role === 'student') {
        const student = await prisma.student.findUnique({ where: { cpf } });
        if (!student) return res.status(404).json({ error: "Estudante não cadastrado" });
        
        user = student;
        payload = { 
          studentId: student.id, 
          role: 'student', 
          user: { 
            name: student.name, 
            phone: student.phone, 
            picture: student.picture 
          } 
        };
      }

      // Verifica a senha
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "CPF ou senha inválidos" });
      }

      // Gera o token
      const token = jwt.sign(payload, SECRET_KEY, { 
        expiresIn: '24h',
        algorithm: 'HS256'
      });

      return res.status(200).json({ 
        token, 
        currentRole: payload.role, 
        message: 'Login realizado com sucesso' 
      });

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return res.status(500).json({ error: "Erro interno ao fazer login" });
    }
  }
}