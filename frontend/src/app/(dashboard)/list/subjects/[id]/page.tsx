'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import PrintIcon from '@mui/icons-material/Print';
import Add from '@mui/icons-material/Add';
import { useReactToPrint } from "react-to-print";
import { Course } from "../../../../../interfaces/course";
import { Teacher } from "../../../../../interfaces/teacher";
// import CourseReport from "@/components/report/CourseReport";

interface SingleCoursePageProps {
  params: { id: string };
}

const SingleCoursePage = ({ params }: SingleCoursePageProps) => {
  const { id } = params;
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newCourse, setNewCourse] = useState<Course | undefined>(undefined);

  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ficha do curso - ${new Date().toLocaleDateString()}`,
  });

  useEffect(() => {

    const fetchCourse = async () => {
      const token = Cookies.get("auth_token");
      if (!token) return router.push("/login");

      try {
        const res = await fetch(`http://localhost:3030/course/get-by-id/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar curso");
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchTeachers = async () => {
      const token = Cookies.get("auth_token");
      if (!token) return router.push("/login");
      try {
        const res = await fetch(`http://localhost:3030/teacher/getall-by-course/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar alunos");
        const data = await res.json();
        setTeachers(data);
        console.log(data)
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourse();
    fetchTeachers();
  }, [id]);

  const formatValue = (value: string) => {
    const numeric = value.replace(/\D/g, '').padStart(3, '0'); // Garante pelo menos 3 dígitos
    const integerPart = numeric.slice(0, -2);
    const decimalPart = numeric.slice(-2);

    // Remove zeros à esquerda do inteiro para evitar "000.123"
    const cleanedInteger = integerPart.replace(/^0+/, '') || '0';

    // Aplica ponto como separador de milhar
    const formattedInteger = cleanedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `R$${formattedInteger},${decimalPart}`;
  };
  const updateCourse = async () => {
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`http://localhost:3030/course/update/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCourse,
          registrationFeeValue: Number(newCourse.registrationFeeValue.replace(/[^0-9,]/g, '').replace(',', '.')),
          MonthlyFeeValue: Number(newCourse.MonthlyFeeValue.replace(/[^0-9,]/g, '').replace(',', '.'))
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Erro ao atualizar curso");
      setCourse(data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

    if (loading) return (
      <Box
      flex={1}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <CircularProgress />
    </Box>)
  if (!course) return <Typography>Curso não encontrado.</Typography>;

  return (
    <Box p={3} bgcolor="white" borderRadius={2} m={2} sx={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">Perfil do curso</Typography>
        <Button variant="outlined" onClick={handlePrint}><PrintIcon /></Button>
      </Box>

      <Box display="flex" alignItems="center" gap={2} flexDirection="column" m={6}>
        <Avatar src={course.image} sx={{ width: 150, height: 150 }} />
        <Typography variant="h6" fontWeight="bold" color="primary">{course.name.toUpperCase()}</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="body1">Informações do curso</Typography>
        {isEditing
          ? <Button variant="contained" onClick={updateCourse}>Salvar</Button>
          : <Button
            variant="outlined"
            onClick={() => {
              setIsEditing(true);
              setNewCourse({
                ...course,
                registrationFeeValue: formatValue(
                  (course.registrationFeeValue ?? 0).toString()
                ),
                MonthlyFeeValue: formatValue(
                  (course.MonthlyFeeValue ?? 0).toString()
                ),
              });
            }}
          >
            Editar
          </Button>
        }
      </Box>

      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField
          label="Nome"
          size="small"
          value={isEditing ? newCourse?.name ?? "" : course.name ?? ""}
          onChange={(e) => isEditing && setNewCourse({ ...newCourse, name: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 2 }}
        />
        <TextField
          label="Código"
          size="small"
          value={isEditing ? newCourse?.code ?? "" : course.code ?? ""}
          onChange={(e) => isEditing && setNewCourse({ ...newCourse, code: e.target.value })}
          InputProps={{ readOnly: !isEditing }}
          sx={{ flex: 2 }}
        />

        <TextField
          label="Taxa de matrícula"
          size="small"
          value={
            isEditing
              ? newCourse?.registrationFeeValue ?? ""
              : formatValue((course.registrationFeeValue ?? 0).toString())
          }
          InputProps={{ readOnly: !isEditing }}
          inputProps={{ maxLength: 14 }}
          onChange={(e) =>
            isEditing && setNewCourse({ ...newCourse, registrationFeeValue: formatValue(e.target.value) })
          }
          sx={{ flex: 2 }}

        />

        <TextField
          label="Mensalidade"
          size="small"
          value={
            isEditing
              ? newCourse?.MonthlyFeeValue ?? ""
              : formatValue((course.MonthlyFeeValue ?? 0).toString())
          }
          InputProps={{ readOnly: !isEditing }}
          inputProps={{ maxLength: 14 }}
          onChange={(e) =>
            isEditing && setNewCourse({ ...newCourse, MonthlyFeeValue: formatValue(e.target.value) })
          }
          sx={{ flex: 2 }}

        />


      </Box>


      <Divider sx={{ mb: 3 }} />
      <Typography variant="body1" mb={2}>Professores inscritos</Typography>

      {teachers.length !=0 ? teachers?.map((teacher) => (
        <Box key={teacher.id} display="flex" gap={2} mb={2}>
          <TextField label="Nome" value={teacher.name ?? ""} size="small" InputProps={{ readOnly: true }} sx={{ flex: 2 }} />
          <TextField label="CPF" value={teacher.cpf ?? ""} size="small" InputProps={{ readOnly: true }} sx={{ flex: 1 }} />
          <TextField
            label="Turmas"
            value={
              teacher.Class?.map((turma) => turma.name).join(', ') || "Sem turmas"
            }
            size="small"
            InputProps={{ readOnly: true }}
            sx={{ flex: 3 }}
          />
        </Box>

      )) : (
        <Typography variant="body2" color="textSecondary">Nenhum professor inscrito neste curso.</Typography>
      )}

      {/* <Box sx={{ display: "none" }}>
        <CourseReport ref={printRef} course={course} teachers={teachers} />
      </Box> */}
    </Box>
  );
};

export default SingleCoursePage;