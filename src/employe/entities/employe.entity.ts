import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Demande } from 'src/demande/entities/demande.entity';

@Entity()
export class Employe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @OneToMany(() => Demande, (demande) => demande.employe)
  demandes: Demande[]; // ✅ أضف هذا السطر
}
