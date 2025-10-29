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

  return (
    <section id="inscription-form" className="form-section animated-section">
      <div className="form-container">
        <h2 className="form-title">Inscription / Contact</h2>
        <p className="form-description">
          Veuillez remplir le formulaire ci-dessous pour vous inscrire à une formation ou nous laisser un message. Nous vous contacterons très prochainement !
        </p>
        <form onSubmit={handleRegistrationSubmit} className="registration-form" ref={registrationFormRef}>
          <div className="form-group">
            <label htmlFor="nom">Nom :</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={registrationForm.nom}
              onChange={handleRegistrationChange}
              required
              placeholder="Votre nom"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="prenom">Prénom :</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={registrationForm.prenom}
              onChange={handleRegistrationChange}
              required
              placeholder="Votre prénom"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact (Numéro WhatsApp) :</label>
            <div className="contact-input-row">
              <select
                id="countryCode"
                name="countryCode"
                value={registrationForm.countryCode}
                onChange={handleRegistrationChange}
                required
                className="form-input country-code-select"
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
                className="form-input"
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

          <div className="form-group">
            <label className="modules-label">Modules souhaités (Sélectionnez un ou plusieurs) :</label>
            <div className="modules-checkbox-grid">
              {modulesData.length > 0 ? (
                modulesData.map((module) => (
                  <label key={module.slug} className="checkbox-item">
                    <input
                      type="checkbox"
                      value={module.slug}
                      checked={registrationForm.modulesSouhaites.includes(module.slug)}
                      onChange={handleModuleSelection}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">{module.title}</span>
                  </label>
                ))
              ) : (
                <p>Chargement des modules ou aucun module disponible.</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Votre message (optionnel) :</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={registrationForm.message}
              onChange={handleRegistrationChange}
              placeholder="Des questions spécifiques ? Laissez votre message ici."
              className="form-textarea"
            ></textarea>
          </div>

          {registrationSubmitMessage && (
            <p className={`submit-message ${registrationSubmitMessage.includes('Erreur') ? 'error' : ''}`}>
              {registrationSubmitMessage}
            </p>
          )}

          <button type="submit" className="submit-btn" disabled={isSubmittingRegistration}>
            {isSubmittingRegistration ? 'Envoi en cours...' : 'Envoyer ma demande'}
          </button>
        </form>
      </div>
    </section>
  );
}