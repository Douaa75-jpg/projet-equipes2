import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto'; // Adapte le chemin selon ton projet
import * as bcrypt from 'bcrypt';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';


@Injectable()
export class UtilisateursService {
  constructor(private prisma: PrismaService , ) {}

  // Trouver un utilisateur par email
  async findByEmail(email: string) {
    if (!email) {
      throw new Error('L\'email ne peut pas être vide');
    }
    return this.prisma.utilisateur.findUnique({
      where: { email },
    });
  }
  private readonly DEFAULT_ANNUAL_LEAVE = 30;

  async create(createUtilisateurDto: CreateUtilisateurDto) {
    console.log(createUtilisateurDto.email);


    const entreprise = await this.prisma.entreprise.findUnique({
      where: { code: createUtilisateurDto.entrepriseCode },
    });
    
    if (!entreprise) {
      throw new ForbiddenException('Code entreprise invalide. Seuls les employés de Zeta Box peuvent s\'inscrire.');
    }
    
    if (entreprise.code !== process.env.ZETA_BOX_CODE) {
      throw new ForbiddenException('Seuls les employés de Zeta Box peuvent s\'inscrire.');
    }
    

    const existingUser = await this.prisma.utilisateur.findUnique({
      where: { email: createUtilisateurDto.email },
    });
  
    if (existingUser) {
      throw new ForbiddenException('Cet email est déjà utilisé.');
    }
  
    // Vérifier si le rôle est responsable et si le typeResponsable est valide
    if (createUtilisateurDto.role === 'RESPONSABLE') {
      if (!createUtilisateurDto.typeResponsable) {
        throw new Error('Le typeResponsable est requis pour un responsable.');
      }
  
      if (createUtilisateurDto.typeResponsable !== 'RH' && createUtilisateurDto.typeResponsable !== 'CHEF_EQUIPE') {
        throw new Error('Le typeResponsable doit être RH ou CHEF_EQUIPE.');
      }
    }
      // Vérification du format de la date de naissance
    if (!createUtilisateurDto.datedenaissance) {
      throw new Error("La date de naissance est requise.");
    }

    const date = new Date(createUtilisateurDto.datedenaissance);

    // Vérification que la date est valide
    if (isNaN(date.getTime())) {
      throw new Error("La date de naissance n'est pas valide");
    }

  
    // Hacher le mot de passe avant de l'enregistrer
    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(createUtilisateurDto.motDePasse, SALT_ROUNDS);
  
    // Déterminer la date d'embauche
  const dateEmbauche = createUtilisateurDto.dateEmbauche 
  ? new Date(createUtilisateurDto.dateEmbauche) 
  : new Date(); // Date courante si non fournie


    // Créer l'utilisateur
    const { nom, prenom, email, role, datedenaissance, matricule } = createUtilisateurDto;
    // Vérifier et convertir la date si nécessaire
    let formattedDate;
    if (datedenaissance) {
      formattedDate = new Date(datedenaissance); // Conversion en objet Date
    } else {
      formattedDate = null;  // Ou une valeur par défaut si la date est vide
    }
    const utilisateur = await this.prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        matricule,
        datedenaissance: formattedDate,  // <-- ici, mettre la bonne casse
        motDePasse: hashedPassword,
        role,
        dateEmbauche,
        entrepriseId: entreprise.id, // Ajout de l'entreprise
      },
    });
  
    // Gestion des rôles
    if (utilisateur.role === 'EMPLOYE') {
      // Créer simplement l'employé sans responsable pour l'instant
      await this.prisma.employe.create({
        data: {
          id: utilisateur.id,
          responsableId: createUtilisateurDto.responsableId || null,// responsableId n'est pas nécessaire ici
          soldeConges: this.DEFAULT_ANNUAL_LEAVE
        },
      });
    }
     else if (utilisateur.role === 'RESPONSABLE') {
      const responsableExistant = await this.prisma.responsable.findUnique({
        where: { id: utilisateur.id },
      });
  
      if (responsableExistant) {
        throw new ForbiddenException('Ce responsable existe déjà.');
      }
  
      await this.prisma.responsable.create({
        data: {
          utilisateur: { connect: { id: utilisateur.id } },
          typeResponsable: createUtilisateurDto.typeResponsable,
        },
      });
    }
  
    return utilisateur;
  }
  


  
  // Méthode pour assigner un responsable à un employé
  async assignerResponsable(id: string, responsableId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }

    if (utilisateur.role !== 'EMPLOYE') {
      throw new Error('Seul un employé peut se voir assigner un responsable');
    }

    const employe = await this.prisma.employe.update({
      where: { id: utilisateur.id },
      data: {
        responsableId: responsableId, // Assignation du responsable
      },
    });

    return employe;
  }
 
// Récupérer la liste des employes avec leur responsable
@ApiOperation({ summary: 'Trouver tous les employés' })
@ApiResponse({ status: 200, description: 'Liste des employés récupérée avec succès.' })
async findMany() {
  return this.prisma.employe.findMany({
    select: {
      id: true,
      heuresSupp: true,  // تضمين heuresSupp
      heuresTravail: true, // تضمين heuresTravail
      soldeConges: true,
      nbAbsences: true,
      utilisateur: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          matricule: true,
          datedenaissance: true,
        },
      },
      responsable: {
        select: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              matricule: true,
            },
          },
        },
      },
    },
  });
}


   // Mettre à jour un utilisateur
   async update(id: string, updateUtilisateurDto: UpdateUtilisateurDto) {
    // Trouver l'utilisateur par ID
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!utilisateur) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérification si l'utilisateur est un responsable et la mise à jour de son type
    if (updateUtilisateurDto.role === 'RESPONSABLE' && !updateUtilisateurDto.typeResponsable) {
      throw new Error('Le typeResponsable est requis pour un responsable.');
    }

    // Vérification que le typeResponsable est valide
    if (updateUtilisateurDto.role === 'RESPONSABLE' && 
        (updateUtilisateurDto.typeResponsable !== 'RH' && updateUtilisateurDto.typeResponsable !== 'CHEF_EQUIPE')) {
      throw new Error('Le typeResponsable doit être RH ou CHEF_EQUIPE.');
    }

    // Mise à jour du mot de passe si nécessaire
    if (updateUtilisateurDto.motDePasse) {
      const SALT_ROUNDS = 10;
      updateUtilisateurDto.motDePasse = await bcrypt.hash(updateUtilisateurDto.motDePasse, SALT_ROUNDS);
    }

    // Mettre à jour l'utilisateur avec les nouvelles données
    const updatedUtilisateur = await this.prisma.utilisateur.update({
      where: { id },
      data: updateUtilisateurDto, // Mettre à jour tous les champs du DTO
    });

    return updatedUtilisateur;
  }

 // Supprimer un utilisateur
async remove(id: string) {
  // Vérifier si l'ID est défini
  if (!id) {
    throw new Error('L\'ID de l\'utilisateur est manquant');
  }

  // Rechercher l'utilisateur par ID
  const user = await this.prisma.utilisateur.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  // Si l'utilisateur est un responsable
  if (user.role === 'RESPONSABLE') {
    // Avant de supprimer, mettre responsableId à null pour tous ses employés
    await this.prisma.employe.updateMany({
      where: { responsableId: id },
      data: { responsableId: null },
    });

    // Supprimer aussi l'entrée dans la table "responsable"
    await this.prisma.responsable.delete({
      where: { id: user.id },
    });
  }

  // Supprimer l'utilisateur principal
  await this.prisma.utilisateur.delete({
    where: { id },
  });

  return { message: 'Utilisateur supprimé avec succès, les employés associés sont désormais sans responsable.' };
}


  // Compter le nombre total d'employés
  async countEmployes() {
    return this.prisma.utilisateur.count({
      where: { role: 'EMPLOYE' },
    });
  }

  // Compter le nombre total de responsables
  async countResponsables() {
    return this.prisma.responsable.count({
      where: {
        typeResponsable: 'CHEF_EQUIPE', // Filtrer par typeResponsable CHEF_EQUIPE
      },
    });
  }

 // Trouver tous les utilisateurs
 async findChefsEquipe() {
  const chefs = await this.prisma.responsable.findMany({
    where: { typeResponsable: 'CHEF_EQUIPE' },
    include: {
      utilisateur: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          matricule: true,
          datedenaissance: true,
        },
      },
    },
  });

  return chefs.map(chef => ({
    id: chef.utilisateur.id,
    nom: chef.utilisateur.nom,
    prenom: chef.utilisateur.prenom,
    email: chef.utilisateur.email,
    matricule: chef.utilisateur.matricule,
    datedenaissance: chef.utilisateur.datedenaissance,
  }));
}


// Compter le nombre d'employés sous chaque chef d'équipe
async countEmployesParChefEquipe() {
  // Récupérer tous les chefs d'équipe
  const chefsEquipe = await this.prisma.responsable.findMany({
    where: { typeResponsable: 'CHEF_EQUIPE' },
    include: {
      utilisateur: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          matricule: true,
        },
      },
      employes: { // Relation "employes" définie dans le schéma Prisma
        select: {
          id: true,
        },
      },
    },
  });

  // Formater les résultats pour inclure le nombre d'employés
  return chefsEquipe.map((chef) => ({
    id: chef.id,
    nom: chef.utilisateur.nom,
    prenom: chef.utilisateur.prenom,
    matricule: chef.utilisateur.matricule,
    nombreEmployes: chef.employes.length, // Nombre d'employés sous ce responsable
  }));
}

}