export interface StringFilter {    
    _eq?:string
    _neq?:string
    _in?:string[]
    _startswith?:string
    _notstartswith?:string
    _endswith?:string
    _notendswith?:string
    _contains?:string 
    _notcontains?:string 
    _like?:string
    _notlike?:string
}

export interface NumberFilter {    
    _eq?:number    
    _neq?:number
    _gt?:number
    _gte?:number
    _lt?:number
    _lte?:number
    _in?:number[] 
    _between?:number[]
    _notbetween?:number[]
}

export interface DateFilter {
    _eq?:Date
    _neq?:Date
    _gt?:Date
    _gte?:Date
    _lt?:Date
    _lte?:Date
    _in?:Date[] 
    _between?:Date[]
    _notbetween?:Date[]
}