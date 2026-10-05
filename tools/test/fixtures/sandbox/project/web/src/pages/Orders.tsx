import { apiFetch } from '../api';
export function Orders() { void apiFetch('/orders'); return <h1>Orders</h1>; }
