export interface Tag {
  id: string;
  name: string;
  color: string | null;
  _count?: { notes: number };
}
