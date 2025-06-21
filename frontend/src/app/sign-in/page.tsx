'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

const formatCpf = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const LoginPage = () => {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [selectedValue, setSelectedValue] = useState('');

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCpf(e.target.value));
  };

  const handleChangeUser = (event: any) => {
    setSelectedValue(event.target.value);
    console.log('Selecionado:', event.target.value); // opcional: exibe no console
  };


const handleLogin = async () => {
  try {
    const rawCpf = cpf.replace(/\D/g, '');

    const response = await fetch('http://localhost:3030/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: rawCpf, password, role: selectedValue }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || 'Erro ao fazer login');
      return;
    }

    // Log para depuração
    console.log('Token recebido:', data.token);
    
    // Configura o cookie com opções mais robustas
    Cookies.set('auth_token', data.token, { 
      expires: 1, 
      path: '/', 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Redireciona baseado na role
    switch (data.currentRole) {
      case 'admin':
        router.push('/admin');
        break;
      case 'teacher':
        router.push('/teacher');
        break;
      case 'student':
        router.push('/student');
        break;
      default:
        alert('Perfil não reconhecido.');
    }

  } catch (error) {
    console.error('Erro na requisição de login:', error);
    alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm -mt-10">
          <img src="/logo.png" className="mx-auto h-12 w-auto" alt="Logo" />
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-900">CPF</label>
              <input
                id="cpf"
                type="text"
                value={cpf}
                onChange={handleCpfChange}
                required
                maxLength={14}
                className="mt-2 block w-full rounded-md px-3 py-1.5 text-base outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 block w-full rounded-md px-3 py-1.5 text-base outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
              />
            </div>

            <RadioGroup row onChange={handleChangeUser} value={selectedValue}>
              <FormControlLabel sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}  value='student' control={<Radio/>} label='Estudante' />
              <FormControlLabel sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }} value='teacher' control={<Radio/>} label='Professor' />
              <FormControlLabel sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }} value='admin' control={<Radio/>} label='Administrador' />
            </RadioGroup>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-white font-semibold hover:bg-indigo-500"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
