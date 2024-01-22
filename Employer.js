// Employer object to manage applicants
function Employer(name) {
    this.name = name;
    this.applicants = [];

    // Function to add a new applicant
    this.addApplicant = function (applicant) {
        this.applicants.push(applicant);
        console.log(`Applicant ${applicant.name} added for position ${applicant.position}.`);
    };

    // Function to get the list of applicants
    this.getApplicantsList = function () {
        return this.applicants;
    };
}
