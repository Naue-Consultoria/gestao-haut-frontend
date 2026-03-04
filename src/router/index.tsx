import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PrivateRoute } from './PrivateRoute';
import { GestorRoute } from './GestorRoute';
import LoginPage from '../pages/LoginPage';
import AlterarSenhaPage from '../pages/AlterarSenhaPage';
import DashboardPage from '../pages/DashboardPage';
import IndividualPage from '../pages/IndividualPage';
import PositivacaoPage from '../pages/PositivacaoPage';
import CaptacaoPage from '../pages/CaptacaoPage';
import NegociosPage from '../pages/NegociosPage';
import TreinamentosPage from '../pages/TreinamentosPage';
import InvestimentosPage from '../pages/InvestimentosPage';
import RankingPage from '../pages/RankingPage';
import MetasPage from '../pages/MetasPage';
import ComentariosPage from '../pages/ComentariosPage';
import PlanosAcaoPage from '../pages/PlanosAcaoPage';
import UsuariosPage from '../pages/UsuariosPage';
import RelatoriosPage from '../pages/RelatoriosPage';
import RelatorioPreviewPage from '../pages/RelatorioPreviewPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/alterar-senha" element={<PrivateRoute><AlterarSenhaPage /></PrivateRoute>} />
        <Route path="/relatorios/preview/:slug" element={<PrivateRoute><GestorRoute><RelatorioPreviewPage /></GestorRoute></PrivateRoute>} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="individual" element={<IndividualPage />} />
          <Route path="positivacao" element={<PositivacaoPage />} />
          <Route path="captacao" element={<CaptacaoPage />} />
          <Route path="negocios" element={<NegociosPage />} />
          <Route path="treinamentos" element={<TreinamentosPage />} />
          <Route path="investimentos" element={<InvestimentosPage />} />
          <Route path="ranking" element={<GestorRoute><RankingPage /></GestorRoute>} />
          <Route path="metas" element={<GestorRoute><MetasPage /></GestorRoute>} />
          <Route path="comentarios" element={<GestorRoute><ComentariosPage /></GestorRoute>} />
          <Route path="planos-acao" element={<GestorRoute><PlanosAcaoPage /></GestorRoute>} />
          <Route path="usuarios" element={<GestorRoute><UsuariosPage /></GestorRoute>} />
          <Route path="relatorios" element={<GestorRoute><RelatoriosPage /></GestorRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
