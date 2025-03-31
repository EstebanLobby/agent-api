'use client';

import dynamic from 'next/dynamic';
import { styled } from '@mui/material';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false, loading: () => null });

export const Chart = styled(ApexChart)``;
