// src/demande/entities/demande.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employe } from 'src/employe/entities/employe.entity';
import { TypeDemande, StatutDemande } from './demande.enums';

@Entity()
export class Demande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employe, (employe) => employe.demandes)
  @JoinColumn({ name: 'employeId' })
  employe: Employe;

  @Column({ type: 'enum', enum: TypeDemande })
  type: TypeDemande;

  @Column({ type: 'timestamp' })
  dateDebut: Date;

  @Column({ type: 'timestamp', nullable: true })
  dateFin: Date;

  @Column({ type: 'enum', enum: StatutDemande, default: StatutDemande.SOUMISE })
  statut: StatutDemande;
}
