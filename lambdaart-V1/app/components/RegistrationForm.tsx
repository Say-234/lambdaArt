'use client';

import { useState, useRef } from 'react';

interface Module {
  slug: string;
  iconSrc: string;
  title: string;
  shortDesc: string;
}

interface RegistrationFormProps {
  modulesData: Module[];
  whatsappNumber: string;
}

export default function RegistrationForm({ modulesData, whatsappNumber }: RegistrationFormProps) {
  const registrationFormRef = useRef<HTMLFormElement>(null);

  const [registrationForm, setRegistrationForm] = useState({
    nom: '',
    prenom: '',
    countryCode: '+229',
    contact: '',
    modulesSouhaites: [] as string[],
    message: '',
  });
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [registrationSubmitMessage, setRegistrationSubmitMessage] = useState<string | null>(null);

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleModuleSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setRegistrationForm(prev => {
      const newModules = checked
        ? [...prev.modulesSouhaites, value]
        : prev.modulesSouhaites.filter(slug => slug !== value);
      return { ...prev, modulesSouhaites: newModules };
    });
  };

  const getWhatsappLink = (number: string, message: string = "Bonjour, je suis intéressé par votre formation.") => {
    const encodedMessage = encodeURIComponent(message);
    const cleanedNumber = number.replace(/\D/g, '');
    return `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
  };

  const handleRegistrationSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmittingRegistration(true);
    setRegistrationSubmitMessage(null);

    if (!registrationForm.nom || !registrationForm.prenom || !registrationForm.contact || registrationForm.modulesSouhaites.length === 0) {
      setRegistrationSubmitMessage("Erreur: Veuillez remplir tous les champs obligatoires et sélectionner au moins un module.");
      setIsSubmittingRegistration(false);
      return;
    }
    if (!whatsappNumber) {
      setRegistrationSubmitMessage("Erreur: Le numéro WhatsApp n'est pas configuré. Veuillez réessayer plus tard.");
      setIsSubmittingRegistration(false);
      return;
    }

    if (registrationForm.countryCode === '+229') {
      const beninPhoneNumberRegex = /^[4-7][0-9]{7}$/;
      if (!beninPhoneNumberRegex.test(registrationForm.contact)) {
        setRegistrationSubmitMessage(
          "Erreur: Veuillez entrer un numéro de téléphone béninois valide de 8 chiffres (commençant par 4, 5, 6 ou 7) après le +229."
        );
        setIsSubmittingRegistration(false);
        return;
      }
    }

    const modulesNames = registrationForm.modulesSouhaites
      .map(slug => modulesData.find(m => m.slug === slug)?.title || slug)
      .join(', ');

    const fullContactNumber = registrationForm.countryCode + registrationForm.contact;

    const messageContent = `Nouvelle demande d'inscription :\n` +
      `Nom: ${registrationForm.nom}\n` +
      `Prénom: ${registrationForm.prenom}\n` +
      `Contact: ${fullContactNumber}\n` +
      `Modules souhaités: ${modulesNames}\n` +
      (registrationForm.message ? `Message: ${registrationForm.message}` : '');

    try {
      window.open(getWhatsappLink(whatsappNumber, messageContent), '_blank');
      setRegistrationSubmitMessage("Votre demande a été envoyée ! Nous vous contacterons bientôt.");
      setRegistrationForm({
        nom: '',
        prenom: '',
        countryCode: '+229',
        contact: '',
        modulesSouhaites: [],
        message: '',
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi WhatsApp:", error);
      setRegistrationSubmitMessage("Erreur: Échec de l'envoi de la demande. Veuillez réessayer.");
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  const inputStyles = "w-full p-3 border border-secondary rounded-md text-base text-dark bg-light placeholder-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all duration-300";

  return (
    <section id="inscription-form" className="bg-accent py-xl px-md">
      <div className="max-w-4xl mx-auto bg-white p-xl rounded-lg shadow-lg">
        <h2 className="font-title text-primary text-4xl text-center mb-md">Inscription / Contact</h2>
        <p className="text-dark text-lg text-center mb-lg leading-relaxed">
          Veuillez remplir le formulaire ci-dessous pour vous inscrire à une formation ou nous laisser un message. Nous vous contacterons très prochainement !
        </p>
        <form onSubmit={handleRegistrationSubmit} className="grid gap-lg text-left" ref={registrationFormRef}>
          <div className="grid md:grid-cols-2 gap-lg">
            <div>
              <label htmlFor="nom" className="block mb-xs font-semibold text-dark">Nom :</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={registrationForm.nom}
                onChange={handleRegistrationChange}
                required
                placeholder="Votre nom"
                className={inputStyles}
              />
            </div>
            <div>
              <label htmlFor="prenom" className="block mb-xs font-semibold text-dark">Prénom :</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={registrationForm.prenom}
                onChange={handleRegistrationChange}
                required
                placeholder="Votre prénom"
                className={inputStyles}
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact" className="block mb-xs font-semibold text-dark">Contact (Numéro WhatsApp) :</label>
            <div className="flex items-center gap-2">
              <select
                id="countryCode"
                name="countryCode"
                value={registrationForm.countryCode}
                onChange={handleRegistrationChange}
                required
                className={`${inputStyles} w-1/3`}
                title="Sélectionnez le code pays"
              >
                <option value="+229">+229 (Bénin)</option>
                <option value="+226">+226 (Burkina Faso)</option>
                <option value="+238">+238 (Cap-Vert)</option>
                <option value="+225">+225 (Côte d'Ivoire)</option>
                <option value="+220">+220 (Gambie)</option>
                <option value="+233">+233 (Ghana)</option>
                <option value="+224">+224 (Guinée)</option>
                <option value="+224">+224 (Guinée-Bissau)</option>
                <option value="+241">+241 (Gabon)</option>
                <option value="+231">+231 (Liberia)</option>
                <option value="+223">+223 (Mali)</option>
                <option value="+222">+222 (Mauritanie)</option>
                <option value="+227">+227 (Niger)</option>
                <option value="+234">+234 (Nigeria)</option>
                <option value="+243">+243 (République Démocratique du Congo)</option>
                <option value="+221">+221 (Sénégal)</option>
                <option value="+232">+232 (Sierra Leone)</option>
                <option value="+228">+228 (Togo)</option>
                <option value="+33">+33 (France)</option>
                <option value="+32">+32 (Belgique)</option>
                <option value="+41">+41 (Suisse)</option>
                <option value="+1">+1 (Canada/USA)</option>
                <option value="+44">+44 (Royaume-Uni)</option>
              </select>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={registrationForm.contact}
                onChange={handleRegistrationChange}
                required
                placeholder={
                  registrationForm.countryCode === '+229'
                    ? 'Ex: 01 suivi de 8 chiffres'
                    : (registrationForm.countryCode === '+33' ? 'Ex: 9 chiffres' : 'Votre numéro local')
                }
                className={`${inputStyles} w-2/3`}
                maxLength={registrationForm.countryCode === '+229' ? 10 : (registrationForm.countryCode === '+33' ? 9 : undefined)}
                pattern={registrationForm.countryCode === '+229' ? '[0-9]{8}' : (registrationForm.countryCode === '+33' ? '[0-9]{9}' : undefined)}
                title={
                  registrationForm.countryCode === '+229'
                    ? 'Veuillez entrer un numéro de téléphone béninois de 01 suivi de 8 chiffres (ex: 01XXXXXXXX).'
                    : (registrationForm.countryCode === '+33' ? 'Veuillez entrer un numéro de téléphone français de 9 chiffres (ex: 6XXXXXXXX).' : 'Veuillez entrer votre numéro de téléphone local.')
                }
              />
            </div>
          </div>

          <div>
            <label className="block mb-md font-semibold text-dark">Modules souhaités (Sélectionnez un ou plusieurs) :</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md bg-light p-md rounded-md border border-secondary">
              {modulesData.length > 0 ? (
                modulesData.map((module) => (
                  <label key={module.slug} className="flex items-center cursor-pointer text-dark select-none">
                    <input
                      type="checkbox"
                      value={module.slug}
                      checked={registrationForm.modulesSouhaites.includes(module.slug)}
                      onChange={handleModuleSelection}
                      className="sr-only peer"
                    />
                    <span className="w-6 h-6 bg-white border-2 border-secondary rounded-sm mr-3 flex-shrink-0 peer-checked:bg-primary peer-checked:border-primary transition-all duration-300 relative">
                      <svg className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                    <span>{module.title}</span>
                  </label>
                ))
              ) : (
                <p>Chargement des modules ou aucun module disponible.</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block mb-xs font-semibold text-dark">Votre message (optionnel) :</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={registrationForm.message}
              onChange={handleRegistrationChange}
              placeholder="Des questions spécifiques ? Laissez votre message ici."
              className={inputStyles}
            ></textarea>
          </div>

          {registrationSubmitMessage && (
            <p className={`p-md rounded-md font-medium text-center ${registrationSubmitMessage.includes('Erreur') ? 'bg-red-100 text-red-700 border border-red-700' : 'bg-green-100 text-green-700 border border-green-700'}`}>
              {registrationSubmitMessage}
            </p>
          )}

          <button type="submit" className="bg-primary text-white py-3 px-5 rounded-md text-lg font-bold cursor-pointer transition-all duration-300 shadow-md hover:bg-dark hover:-translate-y-1 hover:shadow-lg disabled:bg-secondary disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" disabled={isSubmittingRegistration}>
            {isSubmittingRegistration ? 'Envoi en cours...' : 'Envoyer ma demande'}
          </button>
        </form>
      </div>
    </section>
  );
}