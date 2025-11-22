# **🧠 Neuro-Sync**

**Inovando o Futuro do Trabalho através da Inclusão Sensorial**

---

## **📖 Sobre o Projeto**

**Neuro-Sync** é uma solução mobile desenvolvida para o desafio **Global Solution 2025 \- O Futuro do Trabalho**.

O projeto aborda a inclusão produtiva de profissionais neurodivergentes (TDAH, TEA, Dislexia, etc.) em ambientes de trabalho híbridos e open-plan. A aplicação permite que colaboradores localizem e reservem "Espaços de Foco" baseados em suas necessidades sensoriais (níveis de ruído e iluminação), promovendo bem-estar, saúde mental e produtividade.

---

### **🎯 Objetivo (ODS 8 e 10\)**

Criar ambientes de trabalho adaptáveis que respeitem a diversidade neurológica, garantindo que a tecnologia atue como uma ferramenta de equidade, não de barreira.

---

## **✨ Funcionalidades Principais**

### **📱 Mobile (React Native)**

1. **Dashboard Sensorial:** Visualização em tempo real das salas disponíveis com indicadores visuais de **Ruído** e **Luz**.  
2. **Reserva Inteligente:** Sistema de agendamento simples e direto, focado em reduzir a carga cognitiva.  
3. **Perfil Personalizado:** Configuração de preferências sensoriais e temas de acessibilidade.  
4. **Acessibilidade Nativa:**  
   * **Tipografia:** Uso das fontes **Atkinson Hyperlegible** (leitura) e **Inter** (UI).  
   * **Temas:** Suporte completo a **Modo Claro** e **Modo Escuro**.  
   * **Feedback Suave:** Uso de Toasts para feedback não-intrusivo e Alertas Modais apenas para ações críticas.

---

### **🔗 Integrações (Simuladas neste MVP)**

* **IoT:** Simulação de sensores de decibéis e luminosidade para atualizar o status das salas.  
* **Backend:** Estrutura preparada para consumo de API REST para autenticação e persistência de reservas.

---

## **🛠️ Tecnologias Utilizadas**

* **Mobile**: React Native (Expo), TypeScript.
* **Navegação**: React Navigation (Stack & Bottom Tabs).
* **Persistência**: AsyncStorage, Context API.
* **UI/UX**: Safe Area Context, Keyboard Aware ScrollView, Toast Message, Expo Font, Ionicons.
* **DevOps & Infraestrutura**:
   * Docker: Containerização da aplicação.
   * Docker Compose: Orquestração de containers.
   * Nginx: Servidor web de alta performance para servir o build web.
   * Azure VM: Ambiente de hospedagem Linux.

---

## **📂 Estrutura do Projeto**

```
Neuro-Sync/  
├── src/  
│   ├── assets/              # Imagens e fontes
│   ├── context/             # Contextos da aplicação  
│   │   ├── ThemeContext.tsx
│   │   └── UserContext.tsx
│   ├── screens/             # Telas da Aplicação  
│   │   ├── SplashScreen.tsx
│   │   ├── SignInScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ReservationsScreen.tsx
│   │   ├── MyProfile.tsx 
│   │   ├── HelpScreen.tsx
│   │   └── AccessibilityScreen.tsx 
│   ├── services/            # Serviços e APIs
│   │   └── storage.ts
│   └── theme/               # Temas da aplicação
│       └── colors.ts
├── Dockerfile               # Configuração de build da imagem
├── docker-compose.yaml      # Orquestração dos serviços
├── nginx.conf               # Configuração do servidor web
├── App.tsx                  # Entrada Principal
├── package.json
└── tsconfig.json
```

---

## **🚀 Como Rodar o Projeto**

### **Pré-requisitos**

* Node.js instalado.  
* Expo CLI instalado globalmente ou via npx.  
* Emulador Android/iOS ou dispositivo físico com o app **Expo Go**.

### **Passo a Passo**

1. **Clone o repositório:**
```
   git clone https://github.com/kgb-fiap/neuro-sync-mobile.git
   cd neuro-sync-mobile
```

2. **Instale as dependências:**
```
   npm install  
   \# ou  
   yarn install
```

3. **Execute o projeto:**
```
   npx expo start
```

4. **Abra no dispositivo:**
```  
   * Escaneie o QR Code com o app Expo Go (Android/iOS).  
   * Ou pressione a para abrir no emulador Android.  
   * Ou pressione i para abrir no simulador iOS.
```

---

## **🧪 Como Testar (Fluxo de Uso)**

1. **Login de Convidado:** Na tela de Login, use o botão **"Testar sem Cadastro"** para entrar rapidamente com um perfil de teste.  
2. **Criar Reserva:**  
   * No **Dashboard** (Home), toque em uma sala disponível.  
   * Veja os detalhes de Ruído/Luz no Modal.  
   * Confirme a reserva.  
3. **Gerenciar Reserva:**  
   * Vá para a aba **Reservas**.  
   * Toque em **Editar** para mudar a data/hora.  
   * Toque em **Cancelar** para remover a reserva.  
4. **Acessibilidade:**  
   * Vá em **Perfil** \-\> **Configurações**.  
   * Alterne entre **Tema Claro/Escuro** (ícone de lua/sol).  
   * Explore a tela de **Acessibilidade**.

<!-- ---

 ## 🧭 Navegação das Telas

Para visualizar o fluxo de navegação e a hierarquia das telas do aplicativo, consulte o nosso diagrama de navegação detalhado. [Clique aqui para ver o fluxo de navegação](link do vídeo no youtube). -->

---

## **👥 Equipe**

* [@gabrielCZz](https://github.com/orgs/kgb-fiap/people/gabrielCZz) - Gabriel Cruz | RM 559613
* [@k-auaferreira](https://github.com/orgs/kgb-fiap/people/k-auaferreira) - Kauã Ferreira | RM 560992
* [@Vi-debu](https://github.com/orgs/kgb-fiap/people/Vi-debu) - Vinicius Bitú | RM 560227

---

**Neuro-Sync © 2025 \- Global Solution FIAP**
