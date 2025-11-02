# RI&E Compliance Dashboard

Een uitgebreide web-gebaseerde RI&E (Risico-Inventarisatie & Evaluatie) ontwerper applicatie die Nederlandse bedrijven helpt bij het identificeren van werkplekrisico's, implementeren van tegenmaatregelen en het onderhouden van compliance met Arbeidsinspectie regelgeving.

## 🚀 Features

### Dashboard & Monitoring
- **Compliance Overzicht**: Real-time monitoring van compliance status met visuele indicatoren
- **Risico Categorieën**: Overzicht van risico's per categorie met statistieken
- **Actie Management**: Prioriteitsgebaseerde actie tracking met deadline monitoring
- **Compliance Timeline**: Visuele tijdlijn van voltooide beoordelingen en deadlines

### Risico Inventarisatie
- **Interactieve Risico Matrix**: 5×5 waarschijnlijkheid × impact matrix voor risico evaluatie
- **Categorieën**: Fysieke werkplek, chemische/biologische gevaren, psychosociale factoren, fysieke belasting, veiligheidsrisico's, omgevingsfactoren
- **Risico Beoordeling**: Automatische berekening van risico niveaus (Laag, Gemiddeld, Hoog, Kritiek)
- **Maatregelen Database**: Huidige en voorgestelde maatregelen per risico

### Document Export
- **RI&E Rapport**: Volledig PDF/Word document met bedrijfsinformatie, risico inventarisatie en actieplan
- **Plan van Aanpak**: Geprioriteerde actielijst met SMART doelen en resource allocatie
- **Compliance Certificaten**: Arbeidsinspectie-ready format met digitale handtekening ondersteuning

### Nederlandse Compliance
- **Arbeidsomstandighedenwet**: Ingebouwde controles voor alle vereisten
- **Sector-specifieke Arbocatalogi**: Integratie met relevante arbocatalogus
- **BHV Planning**: Tools voor Bedrijfshulpverlening en noodsituatie planning
- **Preventiemedewerker**: Rol management en toegangscontrole

## 🛠️ Technische Specificaties

### Frontend
- **Next.js 14** met App Router
- **TypeScript** voor type safety
- **Tailwind CSS** voor responsive design
- **React Hook Form** voor complexe formulieren
- **Zod** voor validatie
- **Lucide React** voor iconen
- **Recharts** voor data visualisatie

### Backend
- **Next.js API Routes** voor backend functionaliteit
- **Prisma ORM** voor database management
- **PostgreSQL** voor data persistentie
- **JWT** voor authenticatie
- **Bcrypt** voor wachtwoord hashing

### Database Schema
- **Users**: Gebruikers met rolgebaseerde toegang
- **Companies**: Bedrijfsinformatie en configuratie
- **Assessments**: RI&E beoordelingen en versies
- **Risks**: Risico inventarisatie met categorieën en niveaus
- **Actions**: Actie tracking met deadlines en prioriteiten
- **Countermeasures**: Tegenmaatregelen per risico

## 🚀 Installatie & Setup

### Vereisten
- Node.js 18+ 
- PostgreSQL 14+
- npm of yarn

### 1. Repository Klonen
```bash
git clone <repository-url>
cd rie-compliance-dashboard
```

### 2. Dependencies Installeren
```bash
npm install
```

### 3. Environment Variabelen
Kopieer `env.example` naar `.env.local` en vul de waarden in:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rie_compliance_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

### 4. Database Setup
```bash
# Database migraties uitvoeren
npx prisma migrate dev

# Database seeden (optioneel)
npx prisma db seed
```

### 5. Development Server Starten
```bash
npm run dev
```

De applicatie is nu beschikbaar op [http://localhost:3000](http://localhost:3000)

## 📁 Project Structuur

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── dashboard/     # Dashboard data endpoints
│   │   ├── risks/         # Risk management endpoints
│   │   ├── actions/       # Action tracking endpoints
│   │   └── reports/       # Document generation endpoints
│   ├── dashboard/         # Dashboard page
│   ├── risks/             # Risk assessment pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── risk-assessment/   # Risk management components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   ├── types.ts          # TypeScript type definitions
│   ├── utils.ts          # Helper functions
│   └── document-generator.ts # Document export utilities
└── prisma/               # Database schema
    └── schema.prisma     # Prisma schema definition
```

## 🔐 Authenticatie & Rollen

### Gebruikersrollen
- **ADMIN**: Volledige toegang tot alle functionaliteiten
- **MANAGER**: Beheer van assessments, risks en actions
- **EMPLOYEE**: Lezen van data en rapporteren van incidenten
- **EXTERNAL_ADVISOR**: Advies en consultatie functionaliteiten

### Permissies
```typescript
// Voorbeeld permissie structuur
const permissions = {
  'read:assessments': ['ADMIN', 'MANAGER', 'EMPLOYEE', 'EXTERNAL_ADVISOR'],
  'create:assessments': ['ADMIN', 'MANAGER'],
  'update:assessments': ['ADMIN', 'MANAGER'],
  'delete:assessments': ['ADMIN'],
  // ... meer permissies
};
```

## 📊 API Endpoints

### Dashboard
- `GET /api/dashboard` - Dashboard overzicht data
- `GET /api/dashboard/compliance` - Compliance statistieken

### Risico's
- `GET /api/risks` - Alle risico's ophalen
- `POST /api/risks` - Nieuw risico aanmaken
- `GET /api/risks/[id]` - Specifiek risico ophalen
- `PUT /api/risks/[id]` - Risico bijwerken
- `DELETE /api/risks/[id]` - Risico verwijderen

### Acties
- `GET /api/actions` - Alle acties ophalen
- `POST /api/actions` - Nieuwe actie aanmaken
- `PUT /api/actions/[id]` - Actie bijwerken
- `DELETE /api/actions/[id]` - Actie verwijderen

### Rapporten
- `POST /api/reports/rie` - RI&E rapport genereren
- `POST /api/reports/action-plan` - Plan van Aanpak genereren
- `POST /api/reports/compliance` - Compliance rapport genereren

## 🎨 UI Components

### Dashboard Components
- `ComplianceOverview` - Compliance score en kritieke gebieden
- `RiskCategories` - Risico categorieën met statistieken
- `ActionManagement` - Actie tracking en management

### Risk Assessment Components
- `RiskMatrix` - Interactieve 5×5 risico matrix
- `RiskForm` - Formulier voor risico toevoegen/bewerken
- `RiskList` - Overzicht van alle risico's

### Layout Components
- `Sidebar` - Navigatie sidebar met rolgebaseerde menu's
- `Header` - Top navigatie met gebruikersinformatie

## 📋 Nederlandse Compliance Features

### Arbeidsomstandighedenwet
- Automatische validatie van vereiste documenten
- Compliance score berekening
- Waarschuwingen voor niet-conforme gebieden

### Sector-specifieke Templates
- Kantoor omgeving
- Productie/Manufacturing
- Zorgsector
- Bouw & Constructie
- Horeca

### BHV Integration
- Noodcontacten beheer
- Evacuatieplannen
- Eerste hulp procedures
- Brandveiligheid checklists

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables (Production)
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="production-nextauth-secret"
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📈 Performance Optimalisatie

### Database
- Geïndexeerde queries voor snelle data retrieval
- Connection pooling voor database efficiëntie
- Caching van veelgebruikte data

### Frontend
- Code splitting voor snellere laadtijden
- Lazy loading van componenten
- Optimized images en assets

## 🔒 Security

### Authentication
- JWT tokens met expiration
- Role-based access control
- Password hashing met bcrypt

### Data Protection
- Input validatie en sanitization
- SQL injection preventie via Prisma
- XSS protection headers

## 🤝 Contributing

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je changes (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📝 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 📞 Support

Voor vragen of ondersteuning:
- Email: support@rie-dashboard.com
- Documentation: [docs.rie-dashboard.com](https://docs.rie-dashboard.com)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🎯 Roadmap

### Phase 1 (MVP) - ✅ Completed
- [x] Basic dashboard met compliance overview
- [x] Risk identification en evaluation
- [x] Simple action planning
- [x] Basic RI&E document export

### Phase 2 - 🔄 In Progress
- [ ] Advanced reporting features
- [ ] Multi-user collaboration
- [ ] Industry-specific templates
- [ ] Automated compliance checking

### Phase 3 - 📋 Planned
- [ ] Mobile application
- [ ] Advanced analytics
- [ ] Third-party integrations
- [ ] AI-powered risk suggestions

---

**Ontwikkeld met ❤️ voor Nederlandse bedrijven en Arbeidsinspectie compliance**