import { AnswerRepository, FormRepository, FormSubmissionRepository, LinkRepository, NoteRepository, PageRepository, QuestionRepository, FileRepository } from ".";
import { SettingRepository } from "./SettingRepository";

export class Repositories {
  public answer: AnswerRepository;
  public link: LinkRepository;
  public file: FileRepository;
  public form: FormRepository;
  public formSubmission: FormSubmissionRepository;
  public note: NoteRepository;
  public question: QuestionRepository;
  public page: PageRepository;
  public setting: SettingRepository;


  private static _current: Repositories = null;
  public static getCurrent = () => {
    if (Repositories._current === null) Repositories._current = new Repositories();
    return Repositories._current;
  }


  constructor() {
    this.answer = new AnswerRepository();
    this.file = new FileRepository();
    this.form = new FormRepository();
    this.formSubmission = new FormSubmissionRepository();
    this.link = new LinkRepository();
    this.note = new NoteRepository();
    this.question = new QuestionRepository();
    this.page = new PageRepository();
    this.setting = new SettingRepository();
  }
}
