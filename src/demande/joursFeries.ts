export interface JourFerie {
    nom: string;
    date: Date;
    estFerie: boolean;
  }
  
  export function getJoursFeries(year: number): JourFerie[] {
    // Calcul des dates variables (ex: Pâques)
    const paques = calculatePaques(year);
    
    // Liste complète des jours fériés (Tunisie + internationaux)
    const holidays: JourFerie[] = [
      // Fixes
      { nom: "Nouvel An", date: new Date(year, 0, 1), estFerie: true },
      { nom: "Fête de la Révolution", date: new Date(year, 0, 14), estFerie: true },
      { nom: "Fête de l'Indépendance", date: new Date(year, 3, 9), estFerie: true },
      { nom: "Fête du Travail", date: new Date(year, 4, 1), estFerie: true },
      { nom: "Fête de la République", date: new Date(year, 6, 25), estFerie: true },
      { nom: "Fête de la Femme", date: new Date(year, 7, 13), estFerie: true },
      { nom: "Fête de l'Évacuation", date: new Date(year, 11, 18), estFerie: true },
      
      // Variables
      { nom: "Lundi de Pâques", date: new Date(paques.getTime() + 86400000), estFerie: false }, // Exemple non férié en Tunisie
    ];
  
    // Normalisation des dates (suppression des heures)
    return holidays.map(holiday => {
      const date = new Date(holiday.date);
      date.setHours(0, 0, 0, 0);
      return { ...holiday, date };
    });
  }
  
  // Algorithme de calcul de Pâques (exemple)
  function calculatePaques(year: number): Date {
    // Algorithme de Gauss simplifié
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
  
    return new Date(year, month, day);
  }
  
  export function estJourFerie(date: Date, joursFeries: JourFerie[]): boolean {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    return joursFeries.some(jf => 
      jf.date.getTime() === dateToCheck.getTime()
    );
  }