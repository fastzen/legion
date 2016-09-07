import {Validation} from 'aurelia-validation';
import {Router} from 'aurelia-router';
import {MemberService} from '../member-service';
import {Member, Payment, YearRates, PaymentRates} from '../models';

export class MembershipApplication{

  static inject = [Validation, MemberService, Router];

  constructor(validation, memberService, router){

    this.validation = validation.on(this)
      .ensure('person.title')
        .isNotEmpty()
      .ensure('person.lastName')
        .isNotEmpty()
        .hasMinLength(2)
        .hasMaxLength(50)
      .ensure('person.firstName')
        .isNotEmpty()
        .hasMinLength(1)
        .hasMaxLength(50)
      .ensure('person.street')
        .isNotEmpty()
        .hasMinLength(3)
        .hasMaxLength(100)
      .ensure('person.city')
        .isNotEmpty()
      .ensure('person.province')
        .isNotEmpty()
        .containsOnlyAlphaOrWhitespace()
      .ensure('person.postalCode')
        .isNotEmpty()
        .containsOnlyAlphanumericsOrWhitespace()
      .ensure('person.email')
        .isNotEmpty()
        .isEmail()
      .ensure('person.dateOfBirth')
        .isNotEmpty()
      .ensure('person.citizenship')
        .isIn(this.countries);

      this.memberService = memberService;
      this.router = router;
  }

  person = {};
  heading = 'New membership';
  payment;
  paymentRates;
  paymentTypes;

  activate(params){
    return this.memberService.getBranchRates().then( results => {

      this.paymentRates = results;
      this.paymentTypes = this.paymentRates.getAllPaymentTypes(true);

      let today = new Date();
      this.payment = new Payment();
      this.payment.datePaid = today.toISOString().substr(0,10);
      this.payment.numberOfYears = 1;
      this.payment.yearPaid = parseInt(today.toISOString().substr(0,4));

      let thisMonth = today.toISOString().substr(5,2);
      let monthsOnOffer = this.paymentRates.getDefaultPaymentType(thisMonth);
      this.payment.paymentType = monthsOnOffer.paymentType;

      this.paymentTypeChanged();
    });

  }

  paymentTypeChanged(){
    let paymentType = this.payment.paymentType;
    let rate = this.paymentRates.getRate(paymentType, this.payment.yearPaid);
    this.payment.amountPaid = parseFloat(rate).toFixed(2);
  }

  yearPaidChanged(){
    let paymentType = this.payment.paymentType;
    let rate = this.paymentRates.getRate(paymentType, this.payment.yearPaid);
    this.payment.amountPaid = parseFloat(rate).toFixed(2);
    let yearOffset = this.paymentRates.getYearOffset(paymentType, this.payment.yearPaid);
  }


  save(){
    this.validation.validate().then(
      () => {

        var person = this.person;
        var newMember = new Member(person);

        this.memberService.saveMember(newMember).then((result) => {
          let member_id = result.id;
          delete this.payment._id
          let newPayment = new Payment(this.payment, member_id);
          this.memberService.savePayment(newPayment).then((result) => {
            this.router.navigate("member-list");
          }).catch((error) => {
            this.error = error;
            this.showing = true;
          });

        });

      }
    );
  }

  get isOrdinaryMember(){
    return (this.person.membershipType === "Ordinary");
  }

  get isAssociateMember(){
    return (this.person.membershipType === "Associate");
  }

  get isAffiliateVotingMember(){
    return (this.person.membershipType === "Affiliate Voting");
  }

  get isAffiliateNonVotingMember(){
    return (this.person.membershipType === "Affiliate Non-Voting");
  }

  get isAssociateMemberTypeOrdinary(){
    return (this.person.associateMemberType == 'Ordinary member relation');
  }

  get isAssociateMemberTypeAssociate(){
    return (this.person.associateMemberType == 'Associate member relation');
  }

  get isAssociateMemberTypeService(){
    return (this.person.associateMemberType == 'Service');
  }

  titles = [
    "Mr",
    "Mrs",
    "Ms"
    ];

  genders = [
    "Male",
    "Female"
  ];

  countries = [
    "Afghanistan",
    "Aland Islands",
    "Albania",
    "Algeria",
    "American Samoa",
    "Andorra",
    "Angola",
    "Anguilla",
    "Antarctica",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Aruba",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bermuda",
    "Bhutan",
    "Bolivia, Plurinational State of",
    "Bonaire, Sint Eustatius and Saba",
    "Bosnia and Herzegovina",
    "Botswana",
    "Bouvet Island",
    "Brazil",
    "British Indian Ocean Territory",
    "Brunei Darussalam",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Cape Verde",
    "Cayman Islands",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Christmas Island",
    "Cocos (Keeling) Islands",
    "Colombia",
    "Comoros",
    "Congo",
    "Congo, the Democratic Republic of the",
    "Cook Islands",
    "Costa Rica",
    "Côte d'Ivoire",
    "Croatia",
    "Cuba",
    "Curaçao",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Ethiopia",
    "Falkland Islands (Malvinas)",
    "Faroe Islands",
    "Fiji",
    "Finland",
    "France",
    "French Guiana",
    "French Polynesia",
    "French Southern Territories",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Gibraltar",
    "Greece",
    "Greenland",
    "Grenada",
    "Guadeloupe",
    "Guam",
    "Guatemala",
    "Guernsey",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Heard Island and McDonald Islands",
    "Holy See (Vatican City State)",
    "Honduras",
    "Hong Kong",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran, Islamic Republic of",
    "Iraq",
    "Ireland",
    "Isle of Man",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jersey",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea, Democratic People's Republic of",
    "Korea, Republic of",
    "Kuwait",
    "Kyrgyzstan",
    "Lao People's Democratic Republic",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Macao",
    "Macedonia, the former Yugoslav Republic of",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Martinique",
    "Mauritania",
    "Mauritius",
    "Mayotte",
    "Mexico",
    "Micronesia, Federated States of",
    "Moldova, Republic of",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Montserrat",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Caledonia",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "Niue",
    "Norfolk Island",
    "Northern Mariana Islands",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestinian Territory, Occupied",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Pitcairn",
    "Poland",
    "Portugal",
    "Puerto Rico",
    "Qatar",
    "Réunion",
    "Romania",
    "Russian Federation",
    "Rwanda",
    "Saint Barthélemy",
    "Saint Helena, Ascension and Tristan da Cunha",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Martin (French part)",
    "Saint Pierre and Miquelon",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Sint Maarten (Dutch part)",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Georgia and the South Sandwich Islands",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Svalbard and Jan Mayen",
    "Swaziland",
    "Sweden",
    "Switzerland",
    "Syrian Arab Republic",
    "Taiwan, Province of China",
    "Tajikistan",
    "Tanzania, United Republic of",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tokelau",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Turks and Caicos Islands",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "United States Minor Outlying Islands",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Venezuela, Bolivarian Republic of",
    "Viet Nam",
    "Virgin Islands, British",
    "Virgin Islands, U.S.",
    "Wallis and Futuna",
    "Western Sahara",
    "Yemen",
    "Zambia",
    "Zimbabwe"
  ];

  membershipTypes = [
    'Ordinary',
    'Associate',
    'Affiliate Voting',
    'Affiliate Non-Voting'
  ];

  serviceTypes = [
    'Reserve "C Class"',
    'Wartime',
    'Can. Reg. Force',
    'Her Majesty’s Reg. Force',
    'Reserve',
    'NATO',
    'RCMP',
    'R.N.F. Constabulary',
    'Wartime Allied Force',
    'Underground Force',
    'Coast Guard',
    'NORAD',
    'US Force',
    'Vietnam',
    'Police Force',
    'Cadet Instructor Cadre (CIC)',
    'Non-military'
  ];

  associateMemberTypes = [
    'Ordinary member relation',
    'Associate member relation',
    'Service'
  ];

  associateServiceTypes = [
    'Cadets or Cadet Civilian Instructor',
    'Navy League of Canada',
    'Federal or Provincial Emergency Response Service',
    'Polish Armed Forces'
  ];

  magazineOptions = [
    'English',
    'French',
    'None'
  ];

}
