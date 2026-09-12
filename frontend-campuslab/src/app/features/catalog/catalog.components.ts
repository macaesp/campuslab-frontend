import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Resource {
    id: string;
    name: string;
    category: 'LABORATORIO' | 'EQUIPO' | 'INSUMO';
    stock: number;
    available: number;
    location: string;
}

@Component({
    selector: 'app-catalog',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './catalog.components.html',
    styleUrl: './catalog.components.css'
})

export class CatalogComponent {
    selectedCategory = 'TODOS';

    resources: Resource[] = [
    { id: 'CAT-01', name: 'Lab. Redes y Telecom', category: 'LABORATORIO', stock: 1, available: 1, location: 'Edificio A - Sala 302' },
    { id: 'CAT-02', name: 'Osciloscopio Digital 100MHz', category: 'EQUIPO', stock: 15, available: 8, location: 'Pañol Central' },
    { id: 'CAT-03', name: 'Kit Arduino Uno Rev3', category: 'INSUMO', stock: 50, available: 32, location: 'Pañol Central' }
];

get filteredResources(): Resource[] {
    if (this.selectedCategory === 'TODOS') return this.resources;
    return this.resources.filter(r => r.category === this.selectedCategory);
    }

updateStock(item: Resource, delta: number): void {
    const newStock = item.stock + delta;
    if (newStock >= 0 && newStock >= item.stock - item.available) {
        item.available += delta;
        item.stock = newStock;
    }
    }
}
