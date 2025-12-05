import React from 'react';
import { Order } from '../types';

const DeliveryPanel: React.FC<{orders: Order[]}> = ({ orders }) => {
    return <div className="p-6"><h2>Panel de Domicilios (En construcción)</h2></div>
}
export default DeliveryPanel;