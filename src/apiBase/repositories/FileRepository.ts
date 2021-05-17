import { injectable } from "inversify";
import { UniqueIdHelper } from "..";
import { DB } from "../db";
import { File } from "../models";


@injectable()
export class FileRepository {


    public save(file: File) {
        if (UniqueIdHelper.isMissing(file.id)) return this.create(file); else return this.update(file);
    }

    public async create(file: File) {
        file.id = UniqueIdHelper.shortId();
        return DB.query(
            "INSERT INTO files ( id ,churchId, type, content, lastModified) VALUES ( ?, ?, ?, ?, NOW());",
            [file.id, file.churchId, file.type, file.content]
        ).then(() => { return file; });
    }

    public async update(file: File) {

        const query = "UPDATE files SET content=?, lastModified=NOW() WHERE id=? AND churchId=?;";
        const params = [file.content, file.id, file.churchId];
        return DB.query(query, params).then(() => { return file });
    }

    public async loadById(id: string) {
        return DB.queryOne("SELECT * FROM files WHERE id=?;", [id]);
    }
}