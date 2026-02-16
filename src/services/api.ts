import { supabase } from './supabaseClient';

export const birthdayService = {
    getAll: async () => {
        try {
            const { data, error } = await supabase
                .from('birthdays')
                .select('*');

            if (error) {
                if (error.code === '42P01') {
                    console.warn("Tabela 'birthdays' não encontrada no Supabase. Retornando lista vazia.");
                    return [];
                }
                throw error;
            }

            // Mapear snake_case (banco) para PascalCase (frontend)
            return (data || []).map((item: any) => ({
                key: item.id ? item.id.toString() : undefined,
                id: item.id,
                Nome: item.nome,
                DataNascimento: item.data_nascimento,
                Celular: item.celular
            }));
        } catch (error) {
            console.error('Erro ao buscar aniversariantes:', error);
            return [];
        }
    },
    save: async (newData: any[]) => {
        try {
            const supabaseData = newData.map(item => {
                const record: any = {
                    nome: item.Nome,
                    data_nascimento: item.DataNascimento,
                    celular: item.Celular
                };

                if (item.id && !item.id.toString().startsWith('new-')) {
                    record.id = item.id;
                }

                // Compatibility with older logic where 'key' might be the ID
                if (item.key && !isNaN(Number(item.key)) && !item.id) {
                    record.id = Number(item.key);
                }

                return record;
            });

            const { error } = await supabase
                .from('birthdays')
                .upsert(supabaseData, { onConflict: 'id' });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Erro ao salvar aniversariantes:', error);
            throw error;
        }
    },
};

export const salesService = {
    getAll: async () => {
        try {
            const { data, error } = await supabase
                .from('comercial_actions')
                .select('*')
                .order('data', { ascending: false });

            if (error) throw error;

            return data.map((item: any) => ({
                id: item.id,
                data: item.data,
                nome: item.nome,
                fone: item.fone,
                acao: item.acao,
                origemCampanha: item.origem_campanha,
                orcamento: item.orcamento,
                canalVenda: item.canal_venda,
                statusAtendimento: item.status_atendimento,
                fechamento: item.fechamento,
                valor: item.valor,
                tipoProcedimento: item.tipo_procedimento,
                profissional: item.profissional,
                observacoes: item.observacoes,
            }));
        } catch (error) {
            console.error('Erro ao buscar vendas:', error);
            throw error;
        }
    },
    save: async (newData: any[]) => {
        try {
            const supabaseData = newData.map(item => {
                const record: any = {
                    data: item.data,
                    nome: item.nome,
                    fone: item.fone,
                    acao: item.acao,
                    origem_campanha: item.origemCampanha,
                    orcamento: item.orcamento,
                    canal_venda: item.canalVenda,
                    status_atendimento: item.statusAtendimento,
                    fechamento: item.fechamento,
                    valor: item.valor,
                    tipo_procedimento: item.tipoProcedimento,
                    profissional: item.profissional,
                    observacoes: item.observacoes,
                };

                if (item.id && !item.id.toString().startsWith('new-')) {
                    record.id = item.id;
                }

                return record;
            });

            const { data, error } = await supabase
                .from('comercial_actions')
                .upsert(supabaseData, { onConflict: 'id' })
                .select();

            if (error) throw error;

            return { success: true, count: data.length };
        } catch (error) {
            console.error('Erro ao salvar vendas:', error);
            throw error;
        }
    },
};

// Deprecated default export for compatibility if needed, but methods are removed
export default {
    get: () => { console.error('API.get deprecated. Use services.'); return Promise.reject('Deprecated'); },
    post: () => { console.error('API.post deprecated. Use services.'); return Promise.reject('Deprecated'); }
};
