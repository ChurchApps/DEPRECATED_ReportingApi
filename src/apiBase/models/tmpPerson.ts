import { ContactInfo } from "./tmpContactInfo"
import { Name } from "./tmpName"
import { FormSubmission } from "./FormSubmission";

export class Person {
    public id?: string;
    public churchId?: string;
    public userId?: string;
    public name?: Name;
    public contactInfo?: ContactInfo;
    public birthDate?: Date;
    public gender?: string;
    public maritalStatus?: string;
    public anniversary?: Date;
    public membershipStatus?: string;
    public householdId?: string;
    public householdRole?: string;
    public photoUpdated?: Date;
    public photo?: string;
    public importKey?: string;

    public formSubmissions?: FormSubmission[];
}
