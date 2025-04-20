import { IsEmail,ValidateIf, IsString,IsNotEmpty, IsEnum , MinLength , IsUUID , IsOptional , IsDateString} from 'class-validator';

export enum TypeResponsable {
  RH = 'RH',
  CHEF_EQUIPE = 'CHEF_EQUIPE',
}


// Définir les rôles comme une énumération possible
export class CreateUtilisateurDto {
  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsEmail()
  email: string;

  @IsEnum({ EMPLOYE: 'EMPLOYE', ADMINISTRATEUR: 'ADMINISTRATEUR', RESPONSABLE: 'RESPONSABLE' })
  role: 'EMPLOYE' | 'ADMINISTRATEUR' | 'RESPONSABLE';  // Validation des rôles possibles

  @IsString()
  @MinLength(6)  // Optionnel : pour imposer une longueur minimale au mot de passe
  motDePasse: string;  // Champ ajouté pour le mot de passe


  @IsOptional()
  @IsUUID()
  responsableId?: string;

  @IsString()  // Validation pour le matricule
  @IsOptional() // Le matricule est optionnel
  matricule?: string;

  @IsOptional()  // La date de naissance est optionnelle
  @IsDateString()  // Validation du format de la date
  datedenaissance?: string;


  @ValidateIf(o => o.role === 'RESPONSABLE')
  @IsEnum(TypeResponsable)  
  @IsNotEmpty()
  typeResponsable?: TypeResponsable;



}
