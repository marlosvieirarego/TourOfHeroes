import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs' ; 
import { Hero } from './hero' ; 
import { HEROES } from './mock-heroes' ;
import { MessageService } from './message.service' ;
import { HttpClient, HttpHeaders} from '@angular/common/http' ;
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  private heroesUrl = 'api/heroes' ;  // URL to web API s
  
  httpOptions = {
    headers: new HttpHeaders({'Content-Type' : 'application/json'})
  };

  constructor(
    private http: HttpClient ,
    private messageService: MessageService) { }


  /** GET heroes from the server */
  getHeroes(): Observable<Hero[]> {
    // TODO: Send the message _after_ fetching the heroes 
    //this.messageService.add('HeroService: fetched heroes') ;
    //return of (HEROES);  // retornava um array de heróis
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  }


  /** GET hero by id. Return `undefined` when id not found */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }


  /** GET hero by ID */
  getHero(id: number): Observable<Hero> {
    // TODO: send the message _after_ fetching the hero
    //this.messageService.add(`HeroService: fetched hero id=${id}`);
    //return of(HEROES.find(hero => hero.id === id));
    const url = `${this.heroesUrl}/${id}`;
      // comando pipe encadeia a execução de várias funções observable
      return this.http.get<Hero>(url).pipe(
      //para cada registro recebido do Observable, executa uma função, no caso, log()
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    )
  }


  /** GET heroes  whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim) {
      return of([]);
    }

    return this.http.get<Hero[]>(`${this.heroesUrl}/'?name='${term}`).pipe(
      tap(name => name.length ?
        this.log(`found heroes matching ${term}`) :
        this.log(`no heroes matching ${term}`)),
      catchError(this.handleError<Hero[]>('searchHeroes', [])) 
    );
  }

  ////////// SAVE methods


  /** POST: add a new hero to the server */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }


  /** DELETE: add a new hero to the server */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }


  /** PUT: add a new hero to the server */
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }


  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(error);

      this.log(`${operation} failed: ${error.message}`);

      return of(result as T);
    } 
  }


  /** Log a HeroService message with the MessageService */
  private log(message) {
    this.messageService.add(`HeroService: ${message}`);
  }


}
