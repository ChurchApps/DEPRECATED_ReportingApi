import { injectable } from "inversify";
import { DB } from "../db";
import { Question } from "../models";
import { UniqueIdHelper } from "../helpers";

@injectable()
export class QuestionRepository {

    public async save(question: Question) {
        if (UniqueIdHelper.isMissing(question.id)) return this.create(question); else return this.update(question);
    }

    public async create(question: Question) {
        question.id = UniqueIdHelper.shortId();
        const sql = "INSERT INTO questions (id, churchId, formId, parentId, title, description, fieldType, placeholder, sort, choices, removed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);";
        const params = [question.id, question.churchId, question.formId, question.parentId, question.title, question.description, question.fieldType, question.placeholder, question.sort, JSON.stringify(question.choices)];
        return DB.query(sql, params).then(() => { return question; });
    }

    public async update(question: Question) {
        return DB.query(
            "UPDATE questions SET formId=?, parentId=?, title=?, description=?, fieldType=?, placeholder=?, sort=?, choices=? WHERE id=? and churchId=?",
            [question.formId, question.parentId, question.title, question.description, question.fieldType, question.placeholder, question.sort, JSON.stringify(question.choices), question.id, question.churchId]
        ).then(() => { return question });
    }

    public async delete(churchId: string, id: string) {
        DB.query("UPDATE questions SET removed=1 WHERE id=? AND churchId=?;", [id, churchId]);
    }

    public async load(churchId: string, id: string) {
        return DB.queryOne("SELECT * FROM questions WHERE id=? AND churchId=? AND removed=0;", [id, churchId]);
    }

    public async loadAll(churchId: string) {
        return DB.query("SELECT * FROM questions WHERE churchId=? AND removed=0;", [churchId]);
    }

    public async loadForForm(churchId: string, formId: string) {
        return DB.query("SELECT * FROM questions WHERE churchId=? AND formId=? AND removed=0;", [churchId, formId]);
    }

    public convertToModel(churchId: string, data: any) {
        const result: Question = { id: data.id, formId: data.formId, parentId: data.parentId, title: data.title, description: data.description, fieldType: data.fieldType, placeholder: data.placeholder, sort: data.sort };
        if (typeof data.choices === "string") result.choices = JSON.parse(data.choices);
        else result.choices = data.choices;
        return result;
    }

    public convertAllToModel(churchId: string, data: any[]) {
        const result: Question[] = [];
        data.forEach(d => result.push(this.convertToModel(churchId, d)));
        return result;
    }

}
