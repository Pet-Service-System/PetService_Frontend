import { useTranslation } from 'react-i18next';


const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="py-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-4">
                <h2 className="text-3xl md:text-4xl font-semibold">
                  Pet Bro
                </h2>
              </div>
              <p className="text-base md:text-lg lg:text-xl">
                {t('introduction_paragraph_2')}
              </p>
              <p className="text-base md:text-lg lg:text-xl">{t('contact_us_at')}: (+00) 123 234</p>
              <p className="text-base md:text-lg lg:text-xl">Email: petmanagementsystem@g</p>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">{t('adress')}</h3>
              <ul className="space-y-2 mb-4">
                <li className="text-base md:text-lg lg:text-xl">{t('adress')}: {t('address_detail')}</li>
              </ul>
              <h3 className="text-lg md:text-xl font-semibold mb-4">{t('contact_info')}:</h3>
              <ul className="space-y-2 mb-4">
                <li className="text-base md:text-lg lg:text-xl">Email: petservicesswp391@gmail.com</li>
                <li className="text-base md:text-lg lg:text-xl">{t('phone')}: (+00) 123 234</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-900 py-4">
        <div className="container mx-auto text-center">
          <p className="text-sm md:text-base lg:text-lg">© 2017 Pet Bro. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;