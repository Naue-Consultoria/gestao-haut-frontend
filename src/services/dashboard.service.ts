import api from '../config/api';
import { DashboardConsolidated, DashboardIndividual, DashboardIndividualYearly, RankingItem, RoiEntry } from '../types';

export const dashboardService = {
  consolidated: async (month: number, year: number): Promise<DashboardConsolidated> => {
    const res = await api.get('/dashboard/consolidated', { params: { month, year } });
    return res.data.data;
  },
  individual: async (brokerId: string, month: number, year: number): Promise<DashboardIndividual> => {
    const res = await api.get(`/dashboard/individual/${brokerId}`, { params: { month, year } });
    return res.data.data;
  },
  consolidatedEvolution: async (year: number): Promise<{ month: number; meta: number; realizado: number }[]> => {
    const res = await api.get('/dashboard/consolidated/evolution', { params: { year } });
    return res.data.data;
  },
  yearlyEvolution: async (brokerId: string, year: number): Promise<{ month: number; meta: number; realizado: number; metaAcumulada: number }[]> => {
    const res = await api.get(`/dashboard/individual/${brokerId}/evolution`, { params: { year } });
    return res.data.data;
  },
  individualYearly: async (brokerId: string, year: number): Promise<DashboardIndividualYearly> => {
    const res = await api.get(`/dashboard/individual/${brokerId}/yearly`, { params: { year } });
    return res.data.data;
  },
  consolidatedYearly: async (year: number): Promise<DashboardConsolidated> => {
    const res = await api.get('/dashboard/consolidated/yearly', { params: { year } });
    return res.data.data;
  },
  ranking: async (month: number, year: number): Promise<RankingItem[]> => {
    const res = await api.get('/dashboard/ranking', { params: { month, year } });
    return res.data.data;
  },
  roi: async (month: number, year: number): Promise<RoiEntry[]> => {
    const res = await api.get('/dashboard/roi', { params: { month, year } });
    return res.data.data;
  },
  roiYearly: async (year: number): Promise<RoiEntry[]> => {
    const res = await api.get('/dashboard/roi/yearly', { params: { year } });
    return res.data.data;
  },
};
