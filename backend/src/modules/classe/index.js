import { prisma } from "../../lib/prisma.js";

//NAO PODE USAR CLASS COMO VARIAVEL, É PALAVRA RESERVADA

export default {
  async createClass(req, res) {
    try {
      const {
        code,
        name,
        turno,
        horario,
        startDate,
        endDate,
        courseId,
        // teacherId,
      } = req.body;

      const classExists = await prisma.class.findUnique({ where: { code } });

      if (classExists) {
        return res
          .status(409)
          .json({ error: "code informado já foi cadastrado" });
      }

      const classe = await prisma.class.create({
        data: {
          code: code.toLowerCase(),
          name,
          turno,
          horario,
          startDate,
          endDate,
          courseId,
          // teacherId
        },
      });

      return res.status(201).json(classe);
    } catch (error) {
      console.error("Erro ao criar class:", error);
      res.status(500).json({ error: "Erro interno ao criar class" });
    }
  },

  // Buscar todos os classs
  async getAllClasses(req, res) {
    try {
      const classes = await prisma.class.findMany({
        include: {
          course: {
            select: {
              name: true,
            },
          },
          teacher: {
            select: {
              name: true,
            },
          },
        },
      });

      return res.status(200).json(classes);
    } catch (error) {
      console.error("Erro ao buscar classes:", error);
      return res.status(500).json({ error: "Erro interno ao buscar classes" });
    }
  },

  async getAllClassesByTeacherId(req, res) {
    try {
      const { teacher_id } = req.params;

      const classes = await prisma.class.findMany({
        where: { teacherId: Number(teacher_id) },
      });

      return res.status(200).json(classes);
    } catch (error) {
      console.error("Erro ao buscar classes por teacher:", error);
      return res
        .status(500)
        .json({ error: "Erro interno ao buscar classes por teacher" });
    }
  },

  // Buscar class por ID
  async getClassByCode(req, res) {
    try {
      const { code } = req.params;

      const classe = await prisma.class.findUnique({
        where: { code: code.toLowerCase() },
      });

      if (!classe) {
        return res.status(404).json({ error: "Class não encontrado" });
      }

      return res.status(200).json(classe);
    } catch (error) {
      console.error("Erro ao buscar class:", error);
      return res.status(500).json({ error: "Erro interno ao buscar class" });
    }
  },
  async getClassById(req, res) {
    try {
      const { id } = req.params;

      const classe = await prisma.class.findUnique({
        where: { id: Number(id) },
      });

      if (!classe) {
        return res.status(404).json({ error: "Class não encontrado" });
      }

      return res.status(200).json(classe);
    } catch (error) {
      console.error("Erro ao buscar class:", error);
      return res.status(500).json({ error: "Erro interno ao buscar class" });
    }
  },

  // Atualizar class
  async updateClass(req, res) {
    try {
      const { id } = req.params;

      const {
        code,
        name,
        turno,
        horario,
        startDate,
        endDate,
        courseId,
        teacherId,
      } = req.body;

      const classExists = await prisma.class.findUnique({
        where: { id: Number(id) },
      });

      if (!classExists) {
        return res.status(404).json({ error: "Class não encontrado" });
      }

      const updatedClass = await prisma.class.update({
        where: {
          id: Number(id),
        },
        data: {
          code,
          name,
          turno,
          horario,
          startDate,
          endDate,
          courseId,
          teacherId,
        },
      });

      return res.status(200).json(updatedClass);
    } catch (error) {
      console.error("Erro ao atualizar class:", error);
      return res.status(500).json({ error: "Erro interno ao atualizar class" });
    }
  },

  async addTeacher(req, res) {
    try {
      const { teacherId, selectedClasses } = req.body;

      const teacherExists = await prisma.teacher.findUnique({
        where: { id: Number(teacherId) },
      });

      if (!teacherExists) {
        return res.status(409).json({ error: "professor nao cadastrado" });
      }

      // Extrai os IDs das turmas selecionadas
      const classIds = selectedClasses.map((classe) => classe.id);

      // Atualiza o campo teacherId de todas as turmas cujo id está na lista classIds
      await prisma.class.updateMany({
        where: {
          id: { in: classIds },
        },
        data: {
          teacherId: Number(teacherId),
        },
      });

      // const list = await prisma.class_teacher.createMany({
      //   data: teacherClasses
      // })

      return res
        .status(200)
        .json({ message: "Matrícula efetuada com sucesso" });
    } catch (error) {}
  },

  // Deletar class
  async deleteClass(req, res) {
    try {
      const { id } = req.params;

      const classe = await prisma.class.findUnique({
        where: { id: Number(id) },
      });

      if (!classe) {
        return res.status(404).json({ error: "Class não encontrado" });
      }

      await prisma.class.delete({
        where: { id: Number(id) },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar class:", error);
      return res.status(500).json({ error: "Erro interno ao deletar class" });
    }
  },
};
